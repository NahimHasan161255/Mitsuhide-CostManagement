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
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { API_BASE_URL } from '../../api/client';

const { Title, Text } = Typography;

interface ControlItem {
  subSysCd: string;
  progId: string;
  kanriName: string;
  nm1?: number;
  nm2?: number;
  ch1?: string;
  ch2?: string;
}

const SUBSYS_OPTIONS = [
  { value: 'ALL', label: 'すべてのサブシステム' },
  { value: 'GK', label: 'GK: 原価管理' },
  { value: 'UR', label: 'UR: 売上管理' },
  { value: 'SR', label: 'SR: 仕入管理' },
  { value: 'VM', label: 'VM: 月次更新' },
  { value: 'AD', label: 'AD: マスタ・共通' },
];

export const ControlMasterPage: React.FC = () => {
  const [data, setData] = useState<ControlItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedSubSys, setSelectedSubSys] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ControlItem | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/control?page=${page}&pageSize=20`;
      if (selectedSubSys && selectedSubSys !== 'ALL') {
        url += `&subSysCd=${encodeURIComponent(selectedSubSys)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        setData(result.items);
        setTotalCount(result.totalCount);
      } else {
        // Fallback demo data
        setData([
          { subSysCd: 'GK', progId: 'GK0010', kanriName: '工事番号採番体系', nm1: 2026, nm2: 4, ch1: '年度(4桁)＋連番(4桁)' },
          { subSysCd: 'GK', progId: 'GK0020', kanriName: '実行予算承認基準額', nm1: 50000000, nm2: 1, ch1: '5千万円以上役員承認' },
          { subSysCd: 'UR', progId: 'UR0010', kanriName: '売上消費税端数処理', nm1: 1, nm2: 10, ch1: '四捨五入' },
          { subSysCd: 'SR', progId: 'SR0010', kanriName: '仕入消費税端数処理', nm1: 1, nm2: 10, ch1: '切捨て' },
          { subSysCd: 'VM', progId: 'VM0010', kanriName: '月次更新締日基準', nm1: 99, nm2: 0, ch1: '当月末日一括更新' },
          { subSysCd: 'AD', progId: 'AD0000', kanriName: 'システム標準消費税率', nm1: 10, nm2: 8, ch1: '標準税率10% / 軽減税率8%' },
        ]);
        setTotalCount(6);
      }
    } catch {
      message.info('処理基準管理マスタ取得中 (デモデータ表示)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, selectedSubSys]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      subSysCd: selectedSubSys !== 'ALL' ? selectedSubSys : 'GK',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: ControlItem) => {
    setEditingItem(record);
    form.resetFields();
    form.setFieldsValue({
      subSysCd: record.subSysCd,
      progId: record.progId,
      kanriName: record.kanriName,
      nm1: record.nm1,
      nm2: record.nm2,
      ch1: record.ch1,
      ch2: record.ch2,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        // Update
        const res = await fetch(`${API_BASE_URL}/api/control/${editingItem.subSysCd}/${editingItem.progId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        if (res.ok) {
          message.success('処理基準を更新しました。');
          setIsModalOpen(false);
          fetchData();
        } else {
          message.error('更新に失敗しました。');
        }
      } else {
        // Create
        const res = await fetch(`${API_BASE_URL}/api/control`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        if (res.ok) {
          message.success('新しい処理基準を登録しました。');
          setIsModalOpen(false);
          fetchData();
        } else {
          const err = await res.json().catch(() => null);
          message.error(err?.message || '新規登録に失敗しました。');
        }
      }
    } catch {
      // Form validation failed
    }
  };

  const handleDelete = async (record: ControlItem) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/control/${record.subSysCd}/${record.progId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        message.success('削除しました。');
        fetchData();
      } else {
        message.error('削除に失敗しました。');
      }
    } catch {
      message.error('通信エラーが発生しました。');
    }
  };

  const getSubSysTag = (subSys: string) => {
    switch (subSys) {
      case 'GK':
        return <Tag color="blue">GK: 原価</Tag>;
      case 'UR':
        return <Tag color="green">UR: 売上</Tag>;
      case 'SR':
        return <Tag color="orange">SR: 仕入</Tag>;
      case 'VM':
        return <Tag color="purple">VM: 月次</Tag>;
      case 'AD':
        return <Tag color="geekblue">AD: 共通</Tag>;
      default:
        return <Tag>{subSys}</Tag>;
    }
  };

  const columns: ColumnsType<ControlItem> = [
    {
      title: 'サブシステム',
      dataIndex: 'subSysCd',
      key: 'subSysCd',
      width: 130,
      render: (val: string) => getSubSysTag(val),
    },
    {
      title: 'プログラムID',
      dataIndex: 'progId',
      key: 'progId',
      width: 130,
      render: (val: string) => <Text strong style={{ color: '#1890ff' }}>{val}</Text>,
    },
    {
      title: '管理名称',
      dataIndex: 'kanriName',
      key: 'kanriName',
      width: 200,
    },
    {
      title: '数値項目1 (基準値等)',
      dataIndex: 'nm1',
      key: 'nm1',
      width: 140,
      align: 'right',
      render: (val?: number) => (val !== undefined && val !== null ? val.toLocaleString() : '-'),
    },
    {
      title: '数値項目2 (端数・単位等)',
      dataIndex: 'nm2',
      key: 'nm2',
      width: 140,
      align: 'right',
      render: (val?: number) => (val !== undefined && val !== null ? val.toLocaleString() : '-'),
    },
    {
      title: '文字項目1 (設定内容・体系)',
      dataIndex: 'ch1',
      key: 'ch1',
      ellipsis: true,
      render: (val?: string) => val || '-',
    },
    {
      title: '文字項目2 (備考)',
      dataIndex: 'ch2',
      key: 'ch2',
      ellipsis: true,
      render: (val?: string) => val || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 110,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="編集">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="削除確認"
            description={`「${record.kanriName} (${record.progId})」を削除してもよろしいですか？`}
            onConfirm={() => handleDelete(record)}
            okText="削除"
            cancelText="キャンセル"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="削除">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      {/* Header Banner */}
      <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Space align="center" size="middle">
              <ControlOutlined className="erp-banner-icon" style={{ color: '#1890ff' }} />
              <div>
                <Title level={4} className="erp-page-title">
                  処理基準管理マスタ (AD1770C)
                </Title>
                <Text type="secondary" className="erp-page-desc">
                  各業務サブシステム（原価・売上・仕入・月次）の動作基準、計算ルール、採番体系を集中管理します
                </Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Button className="erp-banner-btn" icon={<ReloadOutlined />} onClick={fetchData}>
                再読込
              </Button>
              <Button
                type="primary"
                className="erp-banner-btn"
                icon={<PlusOutlined />}
                onClick={handleOpenAdd}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                新規登録<span className="erp-btn-shortcut"> (F1)</span>
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Filter and Table */}
      <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Select
              className="erp-filter-select"
              style={{ width: '100%' }}
              value={selectedSubSys}
              onChange={(val) => {
                setSelectedSubSys(val);
                setPage(1);
              }}
              options={SUBSYS_OPTIONS}
            />
          </Col>
        </Row>

        <Table
          rowKey={(r) => `${r.subSysCd}_${r.progId}`}
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            current: page,
            pageSize: 20,
            total: totalCount,
            onChange: (p) => setPage(p),
            showTotal: (total) => `全 ${total} 件`,
          }}
          size="middle"
          bordered
        />
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        title={editingItem ? '処理基準 編集' : '処理基準 新規登録'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText="保存 (F12)"
        cancelText="キャンセル"
        width={580}
        style={{ maxWidth: '92vw' }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={10}>
              <Form.Item
                name="subSysCd"
                label="サブシステムCD"
                rules={[{ required: true, message: 'サブシステムを選択してください' }]}
              >
                <Select
                  disabled={!!editingItem}
                  options={[
                    { value: 'GK', label: 'GK (原価管理)' },
                    { value: 'UR', label: 'UR (売上管理)' },
                    { value: 'SR', label: 'SR (仕入管理)' },
                    { value: 'VM', label: 'VM (月次更新)' },
                    { value: 'AD', label: 'AD (共通マスタ)' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={14}>
              <Form.Item
                name="progId"
                label="プログラムID"
                rules={[
                  { required: true, message: 'プログラムIDを入力してください' },
                  { max: 7, message: '最大7文字です' },
                ]}
              >
                <Input
                  disabled={!!editingItem}
                  placeholder="例: GK0010, VM0010"
                  maxLength={7}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="kanriName"
            label="管理名称"
            rules={[
              { required: true, message: '管理名称を入力してください' },
              { max: 40, message: '最大40文字です' },
            ]}
          >
            <Input placeholder="例: 工事番号採番体系" maxLength={40} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nm1" label="数値項目1 (基準値/年度等)">
                <InputNumber style={{ width: '100%' }} placeholder="例: 2026" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nm2" label="数値項目2 (税率/桁数等)">
                <InputNumber style={{ width: '100%' }} placeholder="例: 10" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="ch1" label="文字項目1 (設定フォーマット・体系)">
            <Input placeholder="例: 年度(4桁)＋連番(4桁)" maxLength={100} />
          </Form.Item>

          <Form.Item name="ch2" label="文字項目2 (補足・備考)">
            <Input placeholder="補足情報" maxLength={100} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};
