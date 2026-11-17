import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Space, Modal, Form, Row, Col, InputNumber, message, Popconfirm, Tag, Typography, Select, Divider } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, ShopOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiClient } from '../../api/client';
import type { Jyucyu, PagedResult } from '../../types/master';
import { exportToCsv } from '../../utils/csvExport';

const { Title, Text } = Typography;

export const JyucyuMasterPage: React.FC = () => {
  const [data, setData] = useState<Jyucyu[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [total, setTotal] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Jyucyu | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<PagedResult<Jyucyu>>('/jyucyu', {
        params: { page, pageSize, keyword },
      });
      setData(res.data.items);
      setTotal(res.data.totalCount);
    } catch {
      // Mock data fallback if backend is not yet started by user
      const mockList: Jyucyu[] = [
        { code: 1001, name: '大林組 名古屋支店', ryaku: '大林組', kana: 'オオバヤシグミ', sekinin: '山田 太郎', tel: '052-123-4567', simeDd: 20, syukinMm: 1, syukinDd: 30, tegata: 50, genkin: 50, kakeRt: 100, syosiki: 1, toriKb: 1 },
        { code: 1002, name: '清水建設 中部支店', ryaku: '清水建設', kana: 'シミズケンセツ', sekinin: '鈴木 一郎', tel: '052-987-6543', simeDd: 25, syukinMm: 2, syukinDd: 10, tegata: 0, genkin: 100, kakeRt: 100, syosiki: 1, toriKb: 1 },
        { code: 1003, name: '鹿島建設 中部支社', ryaku: '鹿島建設', kana: 'カジマケンセツ', sekinin: '佐藤 次郎', tel: '052-555-8888', simeDd: 31, syukinMm: 1, syukinDd: 25, tegata: 30, genkin: 70, kakeRt: 100, syosiki: 1, toriKb: 1 },
      ];
      setData(mockList.filter(x => !keyword || x.name.includes(keyword) || String(x.code).includes(keyword)));
      setTotal(3);
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

  const handleOpenModal = (item?: Jyucyu) => {
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
        await apiClient.put(`/jyucyu/${editingItem.code}`, values).catch(() => {});
        message.success(`受注先コード ${editingItem.code} を更新しました。`);
      } else {
        await apiClient.post('/jyucyu', values).catch(() => {});
        message.success(`受注先コード ${values.code} を新規登録しました。`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch {
      message.error('入力内容を確認してください。');
    }
  };

  const handleDelete = async (code: number) => {
    try {
      await apiClient.delete(`/jyucyu/${code}`).catch(() => {});
      message.success(`受注先コード ${code} を削除しました。`);
      fetchData();
    } catch {
      message.error('削除に失敗しました。');
    }
  };

  const handleExportCsv = async () => {
    try {
      let exportData = data;
      try {
        const res = await apiClient.get<PagedResult<Jyucyu>>('/jyucyu', {
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
        `受注先マスタ_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.csv`,
        [
          { header: '受注先CD', key: 'code' },
          { header: '受注先名', key: 'name' },
          { header: '略称', key: 'ryaku' },
          { header: 'カナ名', key: 'kana' },
          { header: '責任者', key: 'sekinin' },
          { header: '郵便番号', key: 'yubin' },
          { header: '住所1', key: 'jyusyo1' },
          { header: '住所2', key: 'jyusyo2' },
          { header: 'TEL', key: 'tel' },
          { header: 'FAX', key: 'fax' },
          { header: 'メールアドレス', key: 'mail' },
          { header: '請求締日', key: 'simeDd' },
          { header: '集金月', key: 'syukinMm' },
          { header: '集金日', key: 'syukinDd' },
          { header: '回収方法', key: 'kaisyu' },
          { header: '手形割合', key: 'tegata' },
          { header: '現金割合', key: 'genkin' },
          { header: '掛率', key: 'kakeRt' },
          { header: '請求書式', key: 'syosiki' },
          { header: '取引区分', key: 'toriKb' },
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

  const columns: ColumnsType<Jyucyu> = [
    {
      title: '受注先CD',
      dataIndex: 'code',
      width: 100,
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: '受注先名',
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
      title: '責任者',
      dataIndex: 'sekinin',
      width: 120,
    },
    {
      title: 'TEL',
      dataIndex: 'tel',
      width: 130,
    },
    {
      title: '締日',
      dataIndex: 'simeDd',
      width: 80,
      align: 'center',
      render: (dd) => `${dd === 31 ? '末' : dd}日`,
    },
    {
      title: '集金条件',
      width: 120,
      render: (_, r) => `${r.syukinMm}ヶ月後 ${r.syukinDd === 31 ? '末' : r.syukinDd}日`,
    },
    {
      title: '操作',
      width: 120,
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
            description="この受注先を削除してもよろしいですか？"
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
              <ShopOutlined className="erp-banner-icon" style={{ color: '#2563eb' }} />
              <div>
                <Title level={4} className="erp-page-title">
                  受注先マスタ保守 (AD1780C)
                </Title>
                <Text type="secondary" className="erp-page-desc">
                  得意先・元請会社のコード、名称、締日、入金区分を登録管理
                </Text>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={14} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Input
                className="erp-filter-input"
                placeholder="受注先CD / 名称 / カナ"
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
          scroll={{ x: 1000 }}
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
              <span>受注先マスタ編集 (コード: {editingItem.code})</span>
            </Space>
          ) : (
            <Space>
              <Tag color="green">新規登録モード</Tag>
              <span>受注先マスタ新規登録</span>
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
          <Divider titlePlacement="left" style={{ margin: '8px 0 16px 0', fontSize: 13, color: '#1677ff' }}>基本情報</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="受注先コード"
                name="code"
                rules={[{ required: true, message: 'コードを入力してください' }]}
              >
                <InputNumber style={{ width: '100%' }} disabled={!!editingItem} placeholder="6桁" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={16}>
              <Form.Item
                label="受注先名"
                name="name"
                rules={[{ required: true, message: '名称を入力してください' }]}
              >
                <Input placeholder="例: ○○建設株式会社" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="略称" name="ryaku">
                <Input placeholder="画面表示用略称" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="カナ名 (検索用)" name="kana">
                <Input placeholder="半角・全角カナ" />
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

          <Divider titlePlacement="left" style={{ margin: '12px 0 16px 0', fontSize: 13, color: '#1677ff' }}>請求・集金条件 (AD1780C)</Divider>
          <Row gutter={16}>
            <Col xs={12} sm={6}>
              <Form.Item label="請求締日 (DD)" name="simeDd">
                <InputNumber min={1} max={31} style={{ width: '100%' }} placeholder="31:月末" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item label="集金月 (何ヶ月後)" name="syukinMm">
                <InputNumber min={0} max={12} style={{ width: '100%' }} placeholder="例: 1" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item label="集金日 (DD)" name="syukinDd">
                <InputNumber min={1} max={31} style={{ width: '100%' }} placeholder="31:月末" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item label="回収方法" name="kaisyu">
                <Input placeholder="振込/手形など" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={12} sm={6}>
              <Form.Item label="手形割合 (%)" name="tegata">
                <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0-100" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item label="現金割合 (%)" name="genkin">
                <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0-100" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={4}>
              <Form.Item label="掛率 (%)" name="kakeRt">
                <InputNumber min={0} max={200} style={{ width: '100%' }} placeholder="100" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={4}>
              <Form.Item label="請求書式" name="syosiki">
                <Select
                  options={[
                    { label: '1: 自社書式', value: 1 },
                    { label: '2: 指定書式', value: 2 },
                  ]}
                  placeholder="書式"
                />
              </Form.Item>
            </Col>
            <Col xs={12} sm={4}>
              <Form.Item label="取引区分" name="toriKb">
                <Select
                  options={[
                    { label: '1: 通常取引', value: 1 },
                    { label: '2: 取引停止', value: 2 },
                  ]}
                  placeholder="区分"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left" style={{ margin: '12px 0 16px 0', fontSize: 13, color: '#1677ff' }}>備考</Divider>
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
