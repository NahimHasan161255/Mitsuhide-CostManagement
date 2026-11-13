import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Row,
  Col,
  Input,
  InputNumber,
  Select,
  Tag,
  Modal,
  Form,
  message,
  Popconfirm,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { CustomerSelectModal } from '../../components/Modals/CustomerSelectModal';
import { ProjectSelectModal } from '../../components/Modals/ProjectSelectModal';

const { Title, Text } = Typography;

interface UriageRecord {
  unqId: number;
  uriageDate: number; // YYYYMM
  jyuCyuCd: number;
  jyuNm?: string;
  kojiCd: number;
  kojiSyu: number;
  kojiNm?: string;
  uriageGkNk: number;
  zeiRt: number;
  zeiGk: number;
  uriageGkKm: number;
  biko?: string;
}

export const UR0010Page: React.FC = () => {
  const [data, setData] = useState<UriageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  // Search Filters
  const [searchKojiCd, setSearchKojiCd] = useState<number | undefined>();
  const [searchJyuCd, setSearchJyuCd] = useState<number | undefined>();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UriageRecord | null>(null);
  const [form] = Form.useForm();

  // Search Dialogs
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [isProjectSearchOpen, setIsProjectSearchOpen] = useState(false);

  const formatYearMonth = (val?: number) => {
    if (!val || val.toString().length !== 6) return '-';
    const s = val.toString();
    return `${s.substring(0, 4)}年${s.substring(4, 6)}月度`;
  };

  const handleAmountChange = () => {
    const amount = form.getFieldValue('uriageGkNk') || 0;
    const rate = form.getFieldValue('zeiRt') || 10;
    const tax = Math.floor((amount * rate) / 100);
    const total = amount + tax;
    form.setFieldsValue({ zeiGk: tax, uriageGkKm: total });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5247/api/uriagedata?page=${page}&pageSize=20`;
      if (searchKojiCd) url += `&kojiCd=${searchKojiCd}`;
      if (searchJyuCd) url += `&jyuCyuCd=${searchJyuCd}`;

      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        setData(result.items);
        setTotalCount(result.totalCount);
      } else {
        // Mock fallback
        setData([
          {
            unqId: 1,
            uriageDate: 202610,
            jyuCyuCd: 1001,
            jyuNm: '清水建設 株式会社',
            kojiCd: 1001,
            kojiSyu: 0,
            kojiNm: '新社屋新築工事 (鉄骨工事一式)',
            uriageGkNk: 15000000,
            zeiRt: 10,
            zeiGk: 1500000,
            uriageGkKm: 16500000,
            biko: '中間出来高請求 (第1回出来高払)',
          },
          {
            unqId: 2,
            uriageDate: 202611,
            jyuCyuCd: 1001,
            jyuNm: '清水建設 株式会社',
            kojiCd: 1001,
            kojiSyu: 0,
            kojiNm: '新社屋新築工事 (鉄骨工事一式)',
            uriageGkNk: 15000000,
            zeiRt: 10,
            zeiGk: 1500000,
            uriageGkKm: 16500000,
            biko: '中間出来高請求 (第2回出来高払)',
          },
        ]);
        setTotalCount(2);
      }
    } catch {
      message.info('売上データ取得中 (デモデータ表示)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    const today = new Date();
    const ymNum = today.getFullYear() * 100 + (today.getMonth() + 1);

    form.resetFields();
    form.setFieldsValue({
      uriageDate: ymNum,
      zeiRt: 10,
      uriageGkNk: 0,
      zeiGk: 0,
      uriageGkKm: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: UriageRecord) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await fetch(`http://localhost:5247/api/uriagedata/${editingItem.unqId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        message.success('売上伝票を更新しました。');
      } else {
        await fetch('http://localhost:5247/api/uriagedata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        message.success('売上伝票を登録しました。');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:5247/api/uriagedata/${id}`, { method: 'DELETE' });
      message.success('売上伝票を削除しました。');
      fetchData();
    } catch {
      message.error('削除に失敗しました。');
    }
  };

  const columns: ColumnsType<UriageRecord> = [
    {
      title: '売上年月',
      dataIndex: 'uriageDate',
      key: 'uriageDate',
      width: 120,
      render: (val) => <Tag color="blue">{formatYearMonth(val)}</Tag>,
    },
    {
      title: '請求先 (受注先)',
      dataIndex: 'jyuNm',
      key: 'jyuNm',
      render: (val, r) => (
        <div>
          <Text strong>{val || '-'}</Text>
          <div style={{ fontSize: 11, color: '#888' }}>CD: {r.jyuCyuCd}</div>
        </div>
      ),
    },
    {
      title: '工事名 / コード',
      dataIndex: 'kojiNm',
      key: 'kojiNm',
      render: (val, r) => (
        <div>
          <span>{val || '未割当'}</span>
          <div style={{ fontSize: 11, color: '#1890ff' }}>
            {r.kojiCd}-{r.kojiSyu}
          </div>
        </div>
      ),
    },
    {
      title: '売上金額(税抜)',
      dataIndex: 'uriageGkNk',
      key: 'uriageGkNk',
      align: 'right',
      render: (val) => <Text strong>¥{val.toLocaleString()}</Text>,
    },
    {
      title: '消費税額',
      dataIndex: 'zeiGk',
      key: 'zeiGk',
      align: 'right',
      render: (val) => <span style={{ color: '#888' }}>¥{val.toLocaleString()}</span>,
    },
    {
      title: '請求金額合計(税込)',
      dataIndex: 'uriageGkKm',
      key: 'uriageGkKm',
      align: 'right',
      render: (val) => <Text style={{ color: '#237804', fontWeight: 700 }}>¥{val.toLocaleString()}</Text>,
    },
    {
      title: '請求備考 / 出来高摘要',
      dataIndex: 'biko',
      key: 'biko',
    },
    {
      title: '操作',
      key: 'action',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          <Popconfirm
            title="この売上伝票を削除しますか？"
            onConfirm={() => handleDelete(record.unqId)}
            okText="削除"
            cancelText="キャンセル"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      {/* Search Header */}
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={10}>
            <Space align="center">
              <DollarOutlined style={{ fontSize: 24, color: '#52c41a' }} />
              <div>
                <Title level={4} style={{ margin: 0, color: '#172b3a' }}>
                  工事種目別 売上明細入力 (UR0010)
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  月次出来高請求・売上計上・契約残高リアルタイム管理
                </Text>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={14} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Input
                placeholder="工事コード"
                style={{ width: 120 }}
                value={searchKojiCd}
                onChange={(e) => setSearchKojiCd(Number(e.target.value) || undefined)}
              />
              <Input
                placeholder="受注先コード"
                style={{ width: 120 }}
                value={searchJyuCd}
                onChange={(e) => setSearchJyuCd(Number(e.target.value) || undefined)}
              />
              <Button type="primary" icon={<SearchOutlined />} onClick={fetchData}>
                検索 (F5)
              </Button>
              <Button icon={<ReloadOutlined />} onClick={fetchData}>
                再読込
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate} style={{ background: '#1890ff' }}>
                売上伝票登録 (F1)
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          rowKey="unqId"
          pagination={{
            current: page,
            pageSize: 20,
            total: totalCount,
            onChange: (p) => setPage(p),
            showTotal: (total) => `全 ${total} 件`,
          }}
          bordered
          size="middle"
        />
      </Card>

      {/* Sales Entry Modal */}
      <Modal
        title={editingItem ? '売上伝票 編集' : '新規 売上伝票 登録 (F1)'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        width={720}
        destroyOnClose
        okText="保存"
        cancelText="キャンセル"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="uriageDate"
                label="売上計上年月 (YYYYMM)"
                rules={[{ required: true, message: '売上年月を入力してください' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="例: 202611" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="jyuCyuCd"
                label="受注先コード"
                rules={[{ required: true, message: '受注先を選択してください' }]}
              >
                <Input.Search
                  placeholder="受注先コード"
                  enterButton={<SearchOutlined />}
                  onSearch={() => setIsCustomerSearchOpen(true)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="kojiCd"
                label="工事コード"
                rules={[{ required: true, message: '工事コードを入力してください' }]}
              >
                <Input.Search
                  placeholder="工事コード"
                  enterButton={<SearchOutlined />}
                  onSearch={() => setIsProjectSearchOpen(true)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="kojiSyu" label="工事種目" initialValue={0}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="uriageGkNk"
                label="売上金額 (税抜)"
                rules={[{ required: true, message: '売上金額を入力してください' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  onChange={handleAmountChange}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="zeiRt" label="消費税率 (%)" initialValue={10}>
                <Select
                  options={[
                    { value: 10, label: '10% (標準税率)' },
                    { value: 8, label: '8% (軽減税率)' },
                    { value: 0, label: '0% (非課税)' },
                  ]}
                  onChange={handleAmountChange}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="uriageGkKm" label="税込請求金額 (自動計算)">
                <InputNumber
                  style={{ width: '100%', background: '#f5f5f5', fontWeight: 'bold' }}
                  readOnly
                  formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="biko" label="摘要 / 出来高請求備考">
            <Input.TextArea rows={2} placeholder="第1回出来高請求、鉄骨工事建方完了分 等" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Customer Select Modal */}
      <CustomerSelectModal
        open={isCustomerSearchOpen}
        onCancel={() => setIsCustomerSearchOpen(false)}
        onSelect={(cust) => {
          form.setFieldsValue({ jyuCyuCd: cust.code });
          setIsCustomerSearchOpen(false);
        }}
      />

      {/* Project Select Modal */}
      <ProjectSelectModal
        open={isProjectSearchOpen}
        onCancel={() => setIsProjectSearchOpen(false)}
        onSelect={(proj) => {
          form.setFieldsValue({ kojiCd: proj.kojiCd, kojiSyu: proj.kojiSyu });
          setIsProjectSearchOpen(false);
        }}
      />
    </Space>
  );
};
