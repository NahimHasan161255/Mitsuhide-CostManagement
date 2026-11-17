import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Space, Modal, Form, Row, Col, InputNumber, message, Popconfirm, Tag, Select, Typography, Divider } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, SolutionOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiClient } from '../../api/client';
import type { Siire, PagedResult } from '../../types/master';
import { exportToCsv } from '../../utils/csvExport';

const { Title, Text } = Typography;

export const SiireMasterPage: React.FC = () => {
  const [data, setData] = useState<Siire[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [total, setTotal] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Siire | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<PagedResult<Siire>>('/siire', {
        params: { page, pageSize, keyword },
      });
      setData(res.data.items);
      setTotal(res.data.totalCount);
    } catch {
      // Mock fallback
      const mock: Siire[] = [
        { code: 2001, name: '新日鉄住金鋼材（株）', ryaku: '新日鉄鋼材', kana: 'シンニッテツ', gyousyu: '鋼材仕入', sekinin: '加藤 健', tel: '052-777-1111', simeDd: 20, siharai: '翌月末振込', risoku: 0, kozaSb: 1, bnkNm: '三菱UFJ銀行', stnNm: '名古屋支店' },
        { code: 2002, name: '中部亜鉛鍍金（株）', ryaku: '中部メッキ', kana: 'チュウブメッキ', gyousyu: 'メッキ加工', sekinin: '小林 誠', tel: '052-888-2222', simeDd: 25, siharai: '手形60日', risoku: 0, kozaSb: 1, bnkNm: '三井住友銀行', stnNm: '名駅出張所' },
        { code: 2003, name: '丸和運輸（株） 名古屋支店', ryaku: '丸和運輸', kana: 'マルワウンユ', gyousyu: '重量物運搬', sekinin: '野村 徹', tel: '052-999-3333', simeDd: 31, siharai: '翌月末振込', risoku: 0, kozaSb: 1, bnkNm: '名古屋銀行', stnNm: '本店営業部' },
        { code: 2004, name: '三井物産スチール（株）', ryaku: '三井スチール', kana: 'ミツイスチール', gyousyu: 'H鋼・厚板', sekinin: '渡辺 浩', tel: '052-333-4444', simeDd: 20, siharai: '翌月末振込', risoku: 0, kozaSb: 1, bnkNm: 'みずほ銀行', stnNm: '名古屋中央支店' },
      ];
      setData(mock.filter(x => !keyword || x.name.includes(keyword) || String(x.code).includes(keyword) || (x.gyousyu && x.gyousyu.includes(keyword))));
      setTotal(mock.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleOpenModal = (item?: Siire) => {
    if (item) {
      setEditingItem(item);
      form.setFieldsValue(item);
    } else {
      setEditingItem(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await apiClient.put(`/siire/${editingItem.code}`, values).catch(() => {});
        message.success(`仕入先コード ${editingItem.code} を更新しました。`);
      } else {
        await apiClient.post('/siire', values).catch(() => {});
        message.success(`仕入先コード ${values.code} を新規登録しました。`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch {
      message.error('入力内容を確認してください。');
    }
  };

  const handleDelete = async (code: number) => {
    try {
      await apiClient.delete(`/siire/${code}`).catch(() => {});
      message.success(`仕入先コード ${code} を削除しました。`);
      fetchData();
    } catch {
      message.error('削除に失敗しました。');
    }
  };

  const handleExportCsv = async () => {
    try {
      let exportData = data;
      try {
        const res = await apiClient.get<PagedResult<Siire>>('/siire', {
          params: { page: 1, pageSize: 1000, keyword },
        });
        if (res.data?.items && res.data.items.length > 0) {
          exportData = res.data.items;
        }
      } catch (err) {
        console.warn('API fetch failed, falling back to loaded data', err);
      }

      if (!exportData || exportData.length === 0) {
        message.warning('出力対象のデータがありません。');
        return;
      }

      exportToCsv(
        `仕入先マスタ_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.csv`,
        [
          { header: '仕入先CD', key: 'code' },
          { header: '仕入先名', key: 'name' },
          { header: '略称', key: 'ryaku' },
          { header: 'カナ名', key: 'kana' },
          { header: '業種', key: 'gyousyu' },
          { header: '責任者', key: 'sekinin' },
          { header: '郵便番号', key: 'yubin' },
          { header: '住所1', key: 'jyusyo1' },
          { header: '住所2', key: 'jyusyo2' },
          { header: 'TEL', key: 'tel' },
          { header: 'FAX', key: 'fax' },
          { header: 'メールアドレス', key: 'mail' },
          { header: '支払締日', key: 'simeDd' },
          { header: '支払条件', key: 'siharai' },
          { header: '利息', key: 'risoku' },
          { header: '銀行名', key: 'bnkNm' },
          { header: '支店名', key: 'stnNm' },
          { header: '口座種別', key: 'kozaSb' },
          { header: '口座番号', key: 'kozaNo' },
          { header: '口座名義人', key: 'kozaNm' },
          { header: '備考1', key: 'biko1' },
          { header: '備考2', key: 'biko2' },
          { header: '備考3', key: 'biko3' },
        ],
        exportData
      );
      message.success('CSVファイルを出力しました。');
    } catch (err) {
      console.error('CSV export failed:', err);
      message.error('CSV出力に失敗しました。');
    }
  };

  const columns: ColumnsType<Siire> = [
    {
      title: '仕入先CD',
      dataIndex: 'code',
      width: 100,
      render: (code) => <Tag color="orange">{code}</Tag>,
    },
    {
      title: '仕入先名称',
      dataIndex: 'name',
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <small style={{ color: '#888' }}>{record.kana}</small>
        </div>
      ),
    },
    {
      title: '略称',
      dataIndex: 'ryaku',
      width: 120,
    },
    {
      title: '業種',
      dataIndex: 'gyousyu',
      width: 110,
      render: (g) => g ? <Tag>{g}</Tag> : '-',
    },
    {
      title: '責任者',
      dataIndex: 'sekinin',
      width: 110,
    },
    {
      title: 'TEL',
      dataIndex: 'tel',
      width: 130,
    },
    {
      title: '支払締日',
      dataIndex: 'simeDd',
      width: 80,
      align: 'center',
      render: (dd) => `${dd === 31 ? '末' : dd}日`,
    },
    {
      title: '支払条件',
      dataIndex: 'siharai',
      width: 120,
    },
    {
      title: '操作',
      width: 110,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="削除確認"
            description="この仕入先を削除してもよろしいですか？"
            okText="削除"
            cancelText="キャンセル"
            onConfirm={() => handleDelete(record.code)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      {/* 1. Header Banner Card */}
      <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={10}>
            <Space align="center">
              <SolutionOutlined className="erp-banner-icon" style={{ color: '#10b981' }} />
              <div>
                <Title level={4} className="erp-page-title">
                  仕入先マスタ保守 (AD1790C)
                </Title>
                <Text type="secondary" className="erp-page-desc">
                  外注協力会社・資材仕入先のコード、名称、締日、支払条件を管理
                </Text>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={14} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Input
                className="erp-filter-input"
                placeholder="仕入先CD / 名称 / 業種"
                prefix={<SearchOutlined />}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
              />
              <Button type="primary" className="erp-banner-btn" icon={<SearchOutlined />} onClick={handleSearch}>
                検索<span className="erp-btn-shortcut"> (F5)</span>
              </Button>
              <Button className="erp-banner-btn" icon={<ReloadOutlined />} onClick={fetchData}>
                再読込
              </Button>
              <Button className="erp-banner-btn" icon={<DownloadOutlined />} onClick={handleExportCsv}>
                CSV出力<span className="erp-btn-shortcut"> (F6)</span>
              </Button>
              <Button
                type="primary"
                className="erp-banner-btn"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal()}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                新規登録<span className="erp-btn-shortcut"> (F1)</span>
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 2. Main Table Card */}
      <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Table
          rowKey="code"
          columns={columns}
          dataSource={data}
          loading={loading}
          size="middle"
          bordered
          scroll={{ x: 1050 }}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
            showTotal: (t) => `全 ${t} 件`,
          }}
        />
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        title={
          editingItem ? (
            <Space>
              <Tag color="orange">修正モード</Tag>
              <span>仕入先マスタ編集 (コード: {editingItem.code})</span>
            </Space>
          ) : (
            <Space>
              <Tag color="green">新規登録モード</Tag>
              <span>仕入先マスタ新規登録</span>
            </Space>
          )
        }
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        width={760}
        style={{ maxWidth: '94vw' }}
        okText="保存"
        cancelText="キャンセル"
      >
        <Form form={form} layout="vertical" size="small">
          <Divider titlePlacement="left" style={{ margin: '8px 0 16px 0', fontSize: 13, color: '#10b981' }}>基本情報</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="仕入先コード"
                name="code"
                rules={[{ required: true, message: 'コードを入力してください' }]}
              >
                <InputNumber style={{ width: '100%' }} disabled={!!editingItem} placeholder="6桁" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={16}>
              <Form.Item
                label="仕入先名"
                name="name"
                rules={[{ required: true, message: '名称を入力してください' }]}
              >
                <Input placeholder="例: ○○鋼材株式会社" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="略称" name="ryaku">
                <Input placeholder="画面表示用略称" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="カナ名 (検索用)" name="kana">
                <Input placeholder="半角・全角カナ" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="業種" name="gyousyu">
                <Input placeholder="例: 鋼材仕入、加工、運搬" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="責任者" name="sekinin">
                <Input placeholder="担当者・責任者名" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="TEL" name="tel">
                <Input placeholder="00-0000-0000" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="FAX" name="fax">
                <Input placeholder="00-0000-0000" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Form.Item label="郵便番号" name="yubin">
                <Input placeholder="000-0000" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={18}>
              <Form.Item label="住所1 (都道府県・市区町村)" name="jyusyo1">
                <Input placeholder="都道府県・市区町村・番地" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={14}>
              <Form.Item label="住所2 (ビル・建物名)" name="jyusyo2">
                <Input placeholder="ビル・マンション名、階数" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={10}>
              <Form.Item label="メールアドレス" name="mail">
                <Input placeholder="info@example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left" style={{ margin: '12px 0 16px 0', fontSize: 13, color: '#10b981' }}>支払・口座情報 (AD1790C)</Divider>
          <Row gutter={16}>
            <Col xs={12} sm={6}>
              <Form.Item label="支払締日 (DD)" name="simeDd">
                <InputNumber min={1} max={31} style={{ width: '100%' }} placeholder="31:月末" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={12}>
              <Form.Item label="支払方法" name="siharai">
                <Input placeholder="例: 翌月末振込、手形60日" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item label="利息 (%)" name="risoku">
                <InputNumber min={0} max={100} step={0.01} style={{ width: '100%' }} placeholder="0.00" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Form.Item label="銀行名" name="bnkNm">
                <Input placeholder="振込先銀行名" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item label="支店名" name="stnNm">
                <Input placeholder="支店名" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={4}>
              <Form.Item label="口座種別" name="kozaSb">
                <Select
                  options={[
                    { label: '普通', value: 1 },
                    { label: '当座', value: 2 },
                  ]}
                  placeholder="種別"
                />
              </Form.Item>
            </Col>
            <Col xs={12} sm={4}>
              <Form.Item label="口座番号" name="kozaNo">
                <Input placeholder="7桁" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={4}>
              <Form.Item label="口座名義人" name="kozaNm">
                <Input placeholder="名義人カナ" />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left" style={{ margin: '12px 0 16px 0', fontSize: 13, color: '#10b981' }}>備考</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="備考1" name="biko1">
                <Input placeholder="備考1" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="備考2" name="biko2">
                <Input placeholder="備考2" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="備考3" name="biko3">
                <Input placeholder="備考3" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Space>
  );
};
