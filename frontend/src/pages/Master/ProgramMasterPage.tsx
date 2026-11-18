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
  AppstoreOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { exportToCsv } from '../../utils/csvExport';

const { Title, Text } = Typography;

export interface ProgramMasterItem {
  subSysCd: string;
  progId: string;
  progName: string;
  gyo: number;
  progVer: string;
  maxCnt: number;
  runBad: number; // 0: 起動可, 1: 起動不可
  progOpt?: string;
}

// Master Program List from official specification (プログラム一覧.xls)
const SEED_PROGRAMS: ProgramMasterItem[] = [
  { subSysCd: 'AD', progId: 'AD1010C', progName: '基幹システムメニュー', gyo: 101, progVer: '9.9.9', maxCnt: 20, runBad: 0 },
  { subSysCd: 'AD', progId: 'AD1780C', progName: '受注先マスタ', gyo: 102, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'AD', progId: 'AD1790C', progName: '仕入先マスタ', gyo: 103, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'AD', progId: 'AD1730C', progName: 'ユーザマスタ', gyo: 104, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'GK', progId: 'GK0010', progName: '受注入力', gyo: 105, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'GK', progId: 'GK0020', progName: '予算入力', gyo: 106, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'GK', progId: 'GK0030', progName: '工事台帳', gyo: 107, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'GK', progId: 'GK0110', progName: '月次仕掛計算書', gyo: 108, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'GK', progId: 'GK0120', progName: '工事一覧表', gyo: 109, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'GK', progId: 'GK0130', progName: '工事別粗利管理表', gyo: 110, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'UR', progId: 'UR0010', progName: '工事種目明細', gyo: 111, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'UR', progId: 'UR0120', progName: '売上伝票リスト', gyo: 112, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'SR', progId: 'SR0010', progName: '仕入入力', gyo: 113, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'SR', progId: 'SR0110', progName: '仕入先別工事別仕入管理表', gyo: 114, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'SR', progId: 'SR0120', progName: '仕入伝票リスト', gyo: 115, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'VM', progId: 'VM0010', progName: '月次更新', gyo: 116, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'VM', progId: 'VM0110', progName: '更新履歴照会', gyo: 117, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'AD', progId: 'AD1720C', progName: 'ユーザーグループマスタ', gyo: 201, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'AD', progId: 'AD1740C', progName: 'プログラムマスタ', gyo: 202, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'AD', progId: 'AD1750C', progName: 'メッセージマスタ', gyo: 203, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'AD', progId: 'AD1760C', progName: 'システム名称マスタ', gyo: 204, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
  { subSysCd: 'AD', progId: 'AD1770C', progName: '処理基準管理マスタ', gyo: 205, progVer: '9.9.9', maxCnt: 99999, runBad: 0 },
];

const SUBSYS_TAG_COLORS: Record<string, string> = {
  AD: 'blue',
  GK: 'cyan',
  UR: 'green',
  SR: 'orange',
  VM: 'purple',
};

export const ProgramMasterPage: React.FC = () => {
  const [data, setData] = useState<ProgramMasterItem[]>(SEED_PROGRAMS);
  const [filteredData, setFilteredData] = useState<ProgramMasterItem[]>(SEED_PROGRAMS);
  const [loading, setLoading] = useState(false);
  const [selectedSubSys, setSelectedSubSys] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProgramMasterItem | null>(null);
  const [form] = Form.useForm();

  // Filter
  useEffect(() => {
    let result = [...data];
    if (selectedSubSys) {
      result = result.filter((x) => x.subSysCd === selectedSubSys);
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(
        (x) =>
          x.progId.toLowerCase().includes(q) ||
          x.progName.toLowerCase().includes(q) ||
          x.subSysCd.toLowerCase().includes(q)
      );
    }
    setFilteredData(result);
  }, [data, selectedSubSys, searchText]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      subSysCd: 'AD',
      progVer: '9.9.9',
      maxCnt: 99999,
      gyo: (data.length + 1) * 10,
      runBad: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: ProgramMasterItem) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (progId: string) => {
    setData((prev) => prev.filter((x) => x.progId !== progId));
    message.success(`プログラム ${progId} を削除しました。`);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        setData((prev) =>
          prev.map((item) => (item.progId === editingItem.progId ? { ...item, ...values } : item))
        );
        message.success(`プログラム ${values.progId} を更新しました。`);
      } else {
        if (data.some((x) => x.progId === values.progId)) {
          message.error(`プログラムID ${values.progId} は既に存在します。`);
          return;
        }
        setData((prev) => [...prev, values]);
        message.success(`プログラム ${values.progId} を新規登録しました。`);
      }
      setIsModalOpen(false);
    } catch {
      // Form validation failed
    }
  };

  const handleExportCsv = () => {
    const columns = [
      { header: 'サブシステムCD', key: 'subSysCd' as const },
      { header: 'プログラムID', key: 'progId' as const },
      { header: 'プログラム名称', key: 'progName' as const },
      { header: '表示行', key: 'gyo' as const },
      { header: 'バージョン', key: 'progVer' as const },
      { header: '最大件数', key: 'maxCnt' as const },
      { header: '起動不可フラグ', key: 'runBad' as const },
    ];
    exportToCsv(`プログラムマスタ_AD1740C_${new Date().toISOString().slice(0, 10)}.csv`, columns, filteredData);
  };

  const columns: ColumnsType<ProgramMasterItem> = [
    {
      title: 'サブシステム',
      dataIndex: 'subSysCd',
      key: 'subSysCd',
      width: 120,
      render: (val: string) => (
        <Tag color={SUBSYS_TAG_COLORS[val] || 'default'} style={{ fontWeight: 700, borderRadius: 6 }}>
          {val}
        </Tag>
      ),
    },
    {
      title: 'プログラムID',
      dataIndex: 'progId',
      key: 'progId',
      width: 140,
      render: (val: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>{val}</span>
      ),
    },
    {
      title: 'プログラム名称 (メニュー表示名)',
      dataIndex: 'progName',
      key: 'progName',
      render: (val: string) => <span style={{ fontWeight: 600 }}>{val}</span>,
    },
    {
      title: '表示行',
      dataIndex: 'gyo',
      key: 'gyo',
      width: 90,
      align: 'right',
      render: (val: number) => <span style={{ fontFamily: 'monospace' }}>{val}</span>,
    },
    {
      title: 'Ver',
      dataIndex: 'progVer',
      key: 'progVer',
      width: 90,
      render: (val: string) => <Tag style={{ borderRadius: 6 }}>{val}</Tag>,
    },
    {
      title: '最大件数',
      dataIndex: 'maxCnt',
      key: 'maxCnt',
      width: 110,
      align: 'right',
      render: (val: number) => val?.toLocaleString() || '-',
    },
    {
      title: '状態',
      dataIndex: 'runBad',
      key: 'runBad',
      width: 110,
      align: 'center',
      render: (val: number) =>
        val === 0 ? (
          <Tag color="success" icon={<CheckCircleOutlined />} style={{ borderRadius: 6 }}>
            起動可能
          </Tag>
        ) : (
          <Tag color="error" icon={<StopOutlined />} style={{ borderRadius: 6 }}>
            起動停止
          </Tag>
        ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 130,
      align: 'center',
      render: (_: any, record: ProgramMasterItem) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#2563eb' }} />}
            onClick={() => handleOpenEdit(record)}
            size="small"
          >
            編集
          </Button>
          <Popconfirm
            title="削除確認"
            description={`プログラム「${record.progId}」を削除しますか？`}
            onConfirm={() => handleDelete(record.progId)}
            okText="削除"
            cancelText="キャンセル"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Screen Header Bar */}
      <Card bodyStyle={{ padding: '16px 24px' }} style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space align="center" size={12}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppstoreOutlined style={{ fontSize: 22, color: '#2563eb' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
                    プログラムマスタ (AD1740C)
                  </Title>
                  <Tag color="purple" style={{ borderRadius: 6, fontWeight: 600 }}>
                    システム保守用
                  </Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  工事原価管理システムの各業務プログラム構成・メニュー表示順・起動制御を管理します。
                </Text>
              </div>
            </Space>
          </Col>

          <Col>
            <Space size={8} wrap>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenAdd}
                style={{ background: '#2563eb', borderColor: '#2563eb', fontWeight: 600 }}
              >
                (F1) 新規プログラム登録
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExportCsv} style={{ fontWeight: 600 }}>
                (F6) CSV出力
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    setData(SEED_PROGRAMS);
                    setLoading(false);
                    message.success('プログラムマスタを最新情報に更新しました。');
                  }, 400);
                }}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table Card */}
      <Card bodyStyle={{ padding: '16px' }} style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
        {/* Filter Toolbar */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }} gutter={[12, 12]}>
          <Col xs={24} sm={16} md={12}>
            <Space size={10} style={{ width: '100%' }}>
              <Select
                placeholder="サブシステム区分"
                allowClear
                value={selectedSubSys}
                onChange={setSelectedSubSys}
                style={{ width: 160 }}
                options={[
                  { value: 'AD', label: 'AD: マスタ・共通' },
                  { value: 'GK', label: 'GK: 原価管理' },
                  { value: 'UR', label: 'UR: 売上管理' },
                  { value: 'SR', label: 'SR: 仕入管理' },
                  { value: 'VM', label: 'VM: 更新管理' },
                ]}
              />
              <Input
                placeholder="PGID / プログラム名検索..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ width: 220 }}
              />
            </Space>
          </Col>
          <Col>
            <Text type="secondary" style={{ fontSize: 13 }}>
              該当件数: <strong style={{ color: '#0f172a' }}>{filteredData.length}</strong> 件
            </Text>
          </Col>
        </Row>

        <Table
          rowKey="progId"
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{ pageSize: 12, showSizeChanger: true }}
          bordered
          size="middle"
        />
      </Card>

      {/* Edit/Create Modal */}
      <Modal
        title={editingItem ? `プログラム編集 (${editingItem.progId})` : '新規プログラム登録 (AD1740C)'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="保存"
        cancelText="キャンセル"
        centered
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="subSysCd"
                label="サブシステムCD"
                rules={[{ required: true, message: 'サブシステムCDを選択してください' }]}
              >
                <Select
                  options={[
                    { value: 'AD', label: 'AD: マスタ・システム' },
                    { value: 'GK', label: 'GK: 原価管理' },
                    { value: 'UR', label: 'UR: 売上管理' },
                    { value: 'SR', label: 'SR: 仕入管理' },
                    { value: 'VM', label: 'VM: 月次更新' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="progId"
                label="プログラムID"
                rules={[{ required: true, message: 'プログラムIDを入力してください' }]}
              >
                <Input placeholder="例: AD1740C" disabled={!!editingItem} style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="progName"
            label="プログラム名称 (メニュー表示名)"
            rules={[{ required: true, message: 'プログラム名称を入力してください' }]}
          >
            <Input placeholder="例: プログラムマスタ" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="gyo" label="メニュー表示行" rules={[{ required: true }]}>
                <InputNumber min={1} max={999} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="progVer" label="バージョン">
                <Input placeholder="9.9.9" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="runBad" label="起動可否" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 0, label: '0: 起動可能' },
                    { value: 1, label: '1: 起動不可' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="maxCnt" label="最大明細件数">
            <InputNumber min={0} max={999999} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
