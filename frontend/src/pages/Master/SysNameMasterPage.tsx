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
  TagsOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { API_BASE_URL } from '../../api/client';
import { exportToCsv } from '../../utils/csvExport';

const { Title, Text } = Typography;

interface SysNameItem {
  nameKbn: string;
  nameCd: string;
  ch1: string;
  ch2?: string;
  nm1?: number;
  nm2?: number;
}

const NAME_KBN_OPTIONS = [
  { value: 'GK001', label: 'GK001: 未成完成区分' },
  { value: 'GK002', label: 'GK002: 公民区分' },
  { value: 'GK003', label: 'GK003: 請負形態' },
  { value: 'GK004', label: 'GK004: 税区分' },
  { value: 'AD001', label: 'AD001: 締日区分' },
  { value: 'AD002', label: 'AD002: 担当者区分' },
];

export const SysNameMasterPage: React.FC = () => {
  const [data, setData] = useState<SysNameItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedKbn, setSelectedKbn] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SysNameItem | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/sysname?page=${page}&pageSize=20`;
      if (selectedKbn) url += `&nameKbn=${encodeURIComponent(selectedKbn)}`;
      if (searchText) url += `&keyword=${encodeURIComponent(searchText)}`;

      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        setData(result.items);
        setTotalCount(result.totalCount);
      } else {
        // Fallback demo data
        setData([
          { nameKbn: 'GK001', nameCd: '0', ch1: '未成', ch2: '工事施工中・仕掛', nm1: 1 },
          { nameKbn: 'GK001', nameCd: '1', ch1: '完成', ch2: '完工引渡済', nm1: 2 },
          { nameKbn: 'GK002', nameCd: '1', ch1: '民間', ch2: '一般企業・民間工事', nm1: 1 },
          { nameKbn: 'GK002', nameCd: '2', ch1: '官公庁', ch2: '公共工事・入札', nm1: 2 },
          { nameKbn: 'GK003', nameCd: '1', ch1: '元請', ch2: '直接請負', nm1: 1 },
          { nameKbn: 'GK003', nameCd: '2', ch1: '下請', ch2: 'ゼネコン一次下請', nm1: 2 },
          { nameKbn: 'GK004', nameCd: '1', ch1: '課税 (10%)', ch2: '標準税率', nm1: 10 },
          { nameKbn: 'GK004', nameCd: '2', ch1: '非課税', ch2: '非課税取引', nm1: 0 },
        ]);
        setTotalCount(8);
      }
    } catch {
      message.info('システム名称マスタ取得中 (デモデータ表示)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, selectedKbn]);

  useEffect(() => {
    if (isModalOpen) {
      if (editingItem) {
        form.setFieldsValue(editingItem);
      } else {
        form.resetFields();
        if (selectedKbn) {
          form.setFieldsValue({ nameKbn: selectedKbn });
        }
      }
    }
  }, [isModalOpen, editingItem]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SysNameItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await fetch(`${API_BASE_URL}/api/sysname/${editingItem.nameKbn}/${editingItem.nameCd}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        message.success(`名称 [${editingItem.nameKbn}-${editingItem.nameCd}] を更新しました。`);
      } else {
        await fetch(`${API_BASE_URL}/api/sysname`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        message.success(`新規名称 [${values.nameKbn}-${values.nameCd}] を登録しました。`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (kbn: string, cd: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/sysname/${kbn}/${cd}`, { method: 'DELETE' });
      message.success(`名称 [${kbn}-${cd}] を削除しました。`);
      fetchData();
    } catch {
      message.error('削除に失敗しました。');
    }
  };

  const handleExportCsv = async () => {
    try {
      let exportData = data;
      try {
        let url = `${API_BASE_URL}/api/sysname?page=1&pageSize=1000`;
        if (selectedKbn) url += `&nameKbn=${encodeURIComponent(selectedKbn)}`;
        if (searchText) url += `&keyword=${encodeURIComponent(searchText)}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json.items && json.items.length > 0) {
            exportData = json.items;
          }
        }
      } catch (err) {
        console.warn('API fetch failed, falling back to loaded data', err);
      }

      if (!exportData || exportData.length === 0) {
        message.warning('出力対象のデータがありません。');
        return;
      }

      exportToCsv(
        `システム名称マスタ_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.csv`,
        [
          { header: '名称区分', key: 'nameKbn' },
          { header: '名称CD', key: 'nameCd' },
          { header: '名称・文字列1', key: 'ch1' },
          { header: '略称・文字列2', key: 'ch2' },
          { header: '数値1', key: 'nm1' },
          { header: '数値2', key: 'nm2' },
        ],
        exportData
      );
      message.success('CSVファイルを出力しました。');
    } catch (err) {
      console.error('CSV export failed:', err);
      message.error('CSV出力に失敗しました。');
    }
  };

  const columns: ColumnsType<SysNameItem> = [
    {
      title: '区分',
      dataIndex: 'nameKbn',
      key: 'nameKbn',
      width: 120,
      render: (val) => <Tag color="geekblue">{val}</Tag>,
    },
    {
      title: '名称コード',
      dataIndex: 'nameCd',
      key: 'nameCd',
      width: 120,
      render: (val) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: '名称・表示名 (文字項目1)',
      dataIndex: 'ch1',
      key: 'ch1',
      render: (val) => <Text strong>{val}</Text>,
    },
    {
      title: '略称・補足 (文字項目2)',
      dataIndex: 'ch2',
      key: 'ch2',
    },
    {
      title: '表示順 / 数値',
      dataIndex: 'nm1',
      key: 'nm1',
      width: 120,
      align: 'right',
      render: (val) => val ?? '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 130,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          <Popconfirm
            title={`名称 [${record.ch1}] を削除しますか？`}
            onConfirm={() => handleDelete(record.nameKbn, record.nameCd)}
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
      {/* Header */}
      <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={10}>
            <Space align="center">
              <TagsOutlined className="erp-banner-icon" style={{ color: '#13c2c2' }} />
              <div>
                <Title level={4} className="erp-page-title">
                  システム名称マスタ保守 (AD1760C)
                </Title>
                <Text type="secondary" className="erp-page-desc">
                  汎用コード体系・ドロップダウン項目・区分名称の一元管理
                </Text>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={14} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Select
                className="erp-filter-select"
                placeholder="区分で絞り込み"
                style={{ width: 170 }}
                allowClear
                value={selectedKbn}
                onChange={(v) => setSelectedKbn(v)}
                options={NAME_KBN_OPTIONS}
              />
              <Input
                className="erp-filter-input"
                placeholder="コード / 名称検索"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={fetchData}
                allowClear
              />
              <Button type="primary" className="erp-banner-btn" icon={<SearchOutlined />} onClick={fetchData}>
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
                onClick={handleOpenCreate}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                新規登録<span className="erp-btn-shortcut"> (F1)</span>
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          rowKey={(r) => `${r.nameKbn}-${r.nameCd}`}
          pagination={{
            current: page,
            pageSize: 20,
            total: totalCount,
            onChange: (p) => setPage(p),
            showTotal: (total) => `全 ${total} 件`,
          }}
          bordered
          size="middle"
          scroll={{ x: 850 }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={
          editingItem ? (
            <Space>
              <Tag color="orange">修正モード</Tag>
              <span>システム名称編集 [{editingItem.nameKbn}-{editingItem.nameCd}]</span>
            </Space>
          ) : (
            <Space>
              <Tag color="green">新規登録モード</Tag>
              <span>新規システム名称登録</span>
            </Space>
          )
        }
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        width={560}
        style={{ maxWidth: '92vw' }}
        okText="保存"
        cancelText="キャンセル"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nameKbn"
                label="システム名称区分 (5桁)"
                rules={[{ required: true, message: '区分を入力してください' }]}
              >
                <Input placeholder="例: GK001" disabled={!!editingItem} maxLength={5} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nameCd"
                label="名称コード (7桁)"
                rules={[{ required: true, message: 'コードを入力してください' }]}
              >
                <Input placeholder="例: 0" disabled={!!editingItem} maxLength={7} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="ch1"
            label="名称・表示名 (文字項目1)"
            rules={[{ required: true, message: '表示名を入力してください' }]}
          >
            <Input placeholder="例: 未成 (施工中)" maxLength={100} />
          </Form.Item>

          <Form.Item name="ch2" label="略称・補足説明 (文字項目2)">
            <Input placeholder="例: 工事進行中" maxLength={100} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nm1" label="並び順 / 基準数値 (数字項目1)">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nm2" label="予備数値 (数字項目2)">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Space>
  );
};
