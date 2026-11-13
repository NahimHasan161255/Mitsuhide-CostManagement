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
  ShoppingCartOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ProjectSelectModal } from '../../components/Modals/ProjectSelectModal';
import { SupplierSelectModal } from '../../components/Modals/SupplierSelectModal';

const { Title, Text } = Typography;

interface SiireRecord {
  unqId: number;
  siireDate: number;
  siireCd: number;
  siireNm?: string;
  kojiCd: number;
  kojiSyu: number;
  kojiNm?: string;
  yosaSyu: number;
  yosaSyuNm?: string;
  aiteKam: number;
  siireGkNk: number;
  zeiRt: number;
  zeiGk: number;
  siireGkKm: number;
  biko?: string;
}

const YOSA_SYU_OPTIONS = [
  { value: 101, label: '101: 鋼材・材料費' },
  { value: 102, label: '102: 一次加工・切断' },
  { value: 103, label: '103: 二次加工・鍛冶組立' },
  { value: 104, label: '104: 溶接・検査費' },
  { value: 105, label: '105: メッキ・塗装費' },
  { value: 106, label: '106: 運搬・トレーラー費' },
  { value: 107, label: '107: 現場建方・クレーン費' },
  { value: 108, label: '108: 現場管理・諸経費' },
];

export const SR0010Page: React.FC = () => {
  const [data, setData] = useState<SiireRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  // Search Filters
  const [searchKojiCd, setSearchKojiCd] = useState<number | undefined>();
  const [searchSiireCd, setSearchSiireCd] = useState<number | undefined>();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SiireRecord | null>(null);
  const [form] = Form.useForm();

  // Search Dialogs
  const [isProjectSearchOpen, setIsProjectSearchOpen] = useState(false);
  const [isSupplierSearchOpen, setIsSupplierSearchOpen] = useState(false);

  // Auto calculate tax in modal form
  const handleAmountChange = () => {
    const amount = form.getFieldValue('siireGkNk') || 0;
    const rate = form.getFieldValue('zeiRt') || 10;
    const tax = Math.floor((amount * rate) / 100);
    const total = amount + tax;
    form.setFieldsValue({ zeiGk: tax, siireGkKm: total });
  };

  const formatDate = (val?: number) => {
    if (!val || val.toString().length !== 8) return '-';
    const s = val.toString();
    return `${s.substring(0, 4)}/${s.substring(4, 6)}/${s.substring(6, 8)}`;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5247/api/siiredata?page=${page}&pageSize=20`;
      if (searchKojiCd) url += `&kojiCd=${searchKojiCd}`;
      if (searchSiireCd) url += `&siireCd=${searchSiireCd}`;

      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        setData(result.items);
        setTotalCount(result.totalCount);
      } else {
        // Fallback demo data
        setData([
          {
            unqId: 1,
            siireDate: 20261015,
            siireCd: 2001,
            siireNm: '阪和興業 株式会社',
            kojiCd: 1001,
            kojiSyu: 0,
            kojiNm: '新社屋新築工事 (鉄骨工事一式)',
            yosaSyu: 101,
            yosaSyuNm: '鋼材・材料費',
            aiteKam: 1,
            siireGkNk: 3200000,
            zeiRt: 10,
            zeiGk: 320000,
            siireGkKm: 3520000,
            biko: 'H形鋼 SM490A 納品第3便',
          },
          {
            unqId: 2,
            siireDate: 20261010,
            siireCd: 2003,
            siireNm: '日本非破壊検査 株式会社',
            kojiCd: 1001,
            kojiSyu: 0,
            kojiNm: '新社屋新築工事 (鉄骨工事一式)',
            yosaSyu: 104,
            yosaSyuNm: '溶接・検査費',
            aiteKam: 1,
            siireGkNk: 650000,
            zeiRt: 10,
            zeiGk: 65000,
            siireGkKm: 715000,
            biko: '超音波探傷試験(UT) 柱梁接合部',
          },
          {
            unqId: 3,
            siireDate: 20260928,
            siireCd: 2004,
            siireNm: '朝日防錆塗装 工業',
            kojiCd: 1001,
            kojiSyu: 0,
            kojiNm: '新社屋新築工事 (鉄骨工事一式)',
            yosaSyu: 105,
            yosaSyuNm: 'メッキ・塗装費',
            aiteKam: 1,
            siireGkNk: 1600000,
            zeiRt: 10,
            zeiGk: 160000,
            siireGkKm: 1760000,
            biko: '耐火下地塗装 一式',
          },
        ]);
        setTotalCount(3);
      }
    } catch {
      message.info('仕入データ取得中 (デモデータ表示)');
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
    const todayNum = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    form.resetFields();
    form.setFieldsValue({
      siireDate: todayNum,
      yosaSyu: 101,
      aiteKam: 1,
      zeiRt: 10,
      siireGkNk: 0,
      zeiGk: 0,
      siireGkKm: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: SiireRecord) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await fetch(`http://localhost:5247/api/siiredata/${editingItem.unqId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        message.success('仕入伝票を更新しました。');
      } else {
        await fetch('http://localhost:5247/api/siiredata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        message.success('仕入伝票を登録しました。');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:5247/api/siiredata/${id}`, { method: 'DELETE' });
      message.success('仕入伝票を削除しました。');
      fetchData();
    } catch {
      message.error('削除に失敗しました。');
    }
  };

  const columns: ColumnsType<SiireRecord> = [
    {
      title: '仕入日',
      dataIndex: 'siireDate',
      key: 'siireDate',
      width: 110,
      render: (val) => formatDate(val),
    },
    {
      title: '仕入先',
      dataIndex: 'siireNm',
      key: 'siireNm',
      render: (val, r) => (
        <div>
          <Text strong>{val || '-'}</Text>
          <div style={{ fontSize: 11, color: '#888' }}>CD: {r.siireCd}</div>
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
      title: '予算種目',
      dataIndex: 'yosaSyuNm',
      key: 'yosaSyuNm',
      width: 160,
      render: (val, r) => (
        <span>
          <Tag color="cyan">{r.yosaSyu}</Tag> {val}
        </span>
      ),
    },
    {
      title: '税抜金額 (円)',
      dataIndex: 'siireGkNk',
      key: 'siireGkNk',
      align: 'right',
      render: (val) => <Text strong>¥{val.toLocaleString()}</Text>,
    },
    {
      title: '消費税額 (円)',
      dataIndex: 'zeiGk',
      key: 'zeiGk',
      align: 'right',
      render: (val) => <span style={{ color: '#888' }}>¥{val.toLocaleString()}</span>,
    },
    {
      title: '税込合計 (円)',
      dataIndex: 'siireGkKm',
      key: 'siireGkKm',
      align: 'right',
      render: (val) => <Text style={{ color: '#d46b08', fontWeight: 700 }}>¥{val.toLocaleString()}</Text>,
    },
    {
      title: '備考 / 摘要',
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
            title="この仕入伝票を削除しますか？"
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
              <ShoppingCartOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
              <div>
                <Title level={4} style={{ margin: 0, color: '#172b3a' }}>
                  仕入入力・伝票一覧 (SR0010)
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  発生原価伝票の登録・検索・工事原価への即時反映
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
                placeholder="仕入先コード"
                style={{ width: 120 }}
                value={searchSiireCd}
                onChange={(e) => setSearchSiireCd(Number(e.target.value) || undefined)}
              />
              <Button type="primary" icon={<SearchOutlined />} onClick={fetchData}>
                検索 (F5)
              </Button>
              <Button icon={<ReloadOutlined />} onClick={fetchData}>
                再読込
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate} style={{ background: '#52c41a' }}>
                伝票登録 (F1)
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

      {/* Voucher Entry Modal */}
      <Modal
        title={editingItem ? '仕入伝票 編集' : '新規 仕入伝票 登録 (F1)'}
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
                name="siireDate"
                label="仕入発生日 (YYYYMMDD)"
                rules={[{ required: true, message: '仕入日を入力してください' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="例: 20261113" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="siireCd"
                label="仕入先コード"
                rules={[{ required: true, message: '仕入先を選択してください' }]}
              >
                <Input.Search
                  placeholder="仕入先コード"
                  enterButton={<SearchOutlined />}
                  onSearch={() => setIsSupplierSearchOpen(true)}
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
            <Col span={12}>
              <Form.Item
                name="yosaSyu"
                label="予算種目"
                rules={[{ required: true, message: '予算種目を選択してください' }]}
              >
                <Select options={YOSA_SYU_OPTIONS} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="aiteKam" label="相手科目 (1: 買掛金, 2: 現金)" initialValue={1}>
                <Select
                  options={[
                    { value: 1, label: '1: 買掛金 (掛仕入)' },
                    { value: 2, label: '2: 現金仕入' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="siireGkNk"
                label="仕入金額 (税抜)"
                rules={[{ required: true, message: '金額を入力してください' }]}
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
              <Form.Item name="siireGkKm" label="税込合計金額 (自動計算)">
                <InputNumber
                  style={{ width: '100%', background: '#f5f5f5', fontWeight: 'bold' }}
                  readOnly
                  formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="biko" label="摘要 / 納品伝票備考">
            <Input.TextArea rows={2} placeholder="鋼材規格、便数、検査内容等" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Supplier Select Modal */}
      <SupplierSelectModal
        open={isSupplierSearchOpen}
        onCancel={() => setIsSupplierSearchOpen(false)}
        onSelect={(sup) => {
          form.setFieldsValue({ siireCd: sup.code });
          setIsSupplierSearchOpen(false);
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
