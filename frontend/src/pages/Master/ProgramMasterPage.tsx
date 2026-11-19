import React, { useState, useEffect, useCallback } from 'react';
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
  Form,
  message,
  Popconfirm,
  Typography,
  Tabs,
  Tooltip,
  Modal,
} from 'antd';
import {
  FormOutlined,
  TableOutlined,
  SaveOutlined,
  ClearOutlined,
  SearchOutlined,
  DownloadOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
  UndoOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { exportToCsv } from '../../utils/csvExport';

const { Text } = Typography;

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

const INITIAL_FORM_VALUES: Partial<ProgramMasterItem> = {
  subSysCd: 'GK',
  progVer: '9.9.9',
  maxCnt: 99999,
  gyo: 101,
  runBad: 0,
};

export const ProgramMasterPage: React.FC = () => {
  // Navigation & Tab state: default 'form' (Tab 1: 登録・編集フォーム)
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  // Mode: 'new' (1: 新規登録), 'edit' (2: 修正), 'inquiry' (4: 照会)
  const [mode, setMode] = useState<'new' | 'edit' | 'inquiry'>('new');

  // Master Data & Search
  const [data, setData] = useState<ProgramMasterItem[]>(SEED_PROGRAMS);
  const [selectedSubSys, setSelectedSubSys] = useState<string>('ALL');
  const [searchText, setSearchText] = useState('');

  // Form State
  const [form] = Form.useForm();
  const [currentRecord, setCurrentRecord] = useState<ProgramMasterItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Print Modal State (F8)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Initial Form Reset
  const handleClearForm = useCallback(() => {
    form.resetFields();
    form.setFieldsValue({
      ...INITIAL_FORM_VALUES,
      subSysCd: selectedSubSys !== 'ALL' ? selectedSubSys : 'GK',
    });
    setCurrentRecord(null);
    setMode('new');
    message.info('入力フォームをクリアしました。(新規登録モード)');
  }, [form, selectedSubSys]);

  // Load Record into Form
  const handleLoadRecord = useCallback(
    (item: ProgramMasterItem, targetMode: 'edit' | 'inquiry' = 'edit') => {
      setCurrentRecord(item);
      setMode(targetMode);
      form.setFieldsValue(item);
      setActiveTab('form');
      if (targetMode === 'edit') {
        message.success(`プログラム「${item.progName} (${item.progId})」を修正モードで読み込みました。`);
      } else {
        message.info(`プログラム「${item.progName} (${item.progId})」を照会モードで表示しています。`);
      }
    },
    [form]
  );

  // Check code on blur
  const handleCheckCode = async () => {
    const subSys = form.getFieldValue('subSysCd');
    const prog = form.getFieldValue('progId');
    if (!subSys || !prog) return;
    const existing = data.find((x) => x.subSysCd === subSys && x.progId === prog);
    if (existing && mode === 'new') {
      message.warning(`プログラム [${subSys}-${prog}] は既に登録されています。修正モードに切り替えます。`);
      handleLoadRecord(existing, 'edit');
    }
  };

  // Previous Record (F9)
  const handlePrevRecord = () => {
    if (data.length === 0) return;
    if (!currentRecord) {
      handleLoadRecord(data[data.length - 1], 'edit');
      return;
    }
    const idx = data.findIndex((x) => x.subSysCd === currentRecord.subSysCd && x.progId === currentRecord.progId);
    if (idx > 0) {
      handleLoadRecord(data[idx - 1], 'edit');
    } else {
      message.info('これより前のデータはありません。(最初のデータです)');
    }
  };

  // Next Record (F10)
  const handleNextRecord = () => {
    if (data.length === 0) return;
    if (!currentRecord) {
      handleLoadRecord(data[0], 'edit');
      return;
    }
    const idx = data.findIndex((x) => x.subSysCd === currentRecord.subSysCd && x.progId === currentRecord.progId);
    if (idx >= 0 && idx < data.length - 1) {
      handleLoadRecord(data[idx + 1], 'edit');
    } else {
      message.info('これより後のデータはありません。(最後のデータです)');
    }
  };

  // Save Record (F1)
  const handleSave = async () => {
    if (mode === 'inquiry') {
      message.warning('照会モードのため保存できません。「修正」モードに切り替えてください。');
      return;
    }

    try {
      setIsSaving(true);
      const values = await form.validateFields();
      if (mode === 'edit' && currentRecord) {
        setData((prev) =>
          prev.map((item) =>
            item.subSysCd === currentRecord.subSysCd && item.progId === currentRecord.progId ? { ...item, ...values } : item
          )
        );
        setCurrentRecord({ ...currentRecord, ...values });
        message.success(`プログラム [${values.progId}] を更新しました。`);
      } else {
        setData((prev) => [...prev, values]);
        setCurrentRecord(values);
        setMode('edit');
        message.success(`新規プログラム [${values.progId}] を登録しました。`);
      }
    } catch {
      message.error('入力必須項目またはフォーマットを確認してください。');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Record (F7)
  const handleDeleteCurrent = async () => {
    if (!currentRecord) {
      message.warning('削除対象のデータが読み込まれていません。');
      return;
    }
    setData((prev) =>
      prev.filter((x) => !(x.subSysCd === currentRecord.subSysCd && x.progId === currentRecord.progId))
    );
    message.success(`プログラム [${currentRecord.progId}] を削除しました。`);
    handleClearForm();
  };

  // Export CSV (F6)
  const handleExportCsv = () => {
    if (!data || data.length === 0) {
      message.warning('出力対象のデータがありません。');
      return;
    }
    exportToCsv(
      `プログラムマスタ_AD1740C_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { header: 'サブシステム', key: 'subSysCd' },
        { header: 'プログラムID', key: 'progId' },
        { header: 'プログラム名称', key: 'progName' },
        { header: '表示行', key: 'gyo' },
        { header: 'バージョン', key: 'progVer' },
        { header: '最大件数', key: 'maxCnt' },
        { header: '起動状態', key: 'runBad' },
      ],
      data
    );
  };

  // Keyboard Shortcuts (F1, F2, F4, F5, F6, F7, F8, F9, F10, F11)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'F2') {
        e.preventDefault();
        handleClearForm();
      } else if (e.key === 'F4') {
        e.preventDefault();
        setMode('new');
        form.setFieldsValue({ progId: undefined });
      } else if (e.key === 'F5') {
        e.preventDefault();
        setActiveTab((prev) => (prev === 'form' ? 'list' : 'form'));
      } else if (e.key === 'F6') {
        e.preventDefault();
        handleExportCsv();
      } else if (e.key === 'F7' && mode === 'edit') {
        e.preventDefault();
        handleDeleteCurrent();
      } else if (e.key === 'F8') {
        e.preventDefault();
        setIsPrintModalOpen(true);
      } else if (e.key === 'F9') {
        e.preventDefault();
        handlePrevRecord();
      } else if (e.key === 'F10') {
        e.preventDefault();
        handleNextRecord();
      } else if (e.key === 'F11') {
        e.preventDefault();
        if (currentRecord) form.setFieldsValue(currentRecord);
        else handleClearForm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleClearForm, mode, currentRecord, data]);

  // Filter Data for Tab 2
  const filteredData = data.filter(
    (item) =>
      (selectedSubSys === 'ALL' || item.subSysCd === selectedSubSys) &&
      (!searchText ||
        item.progName.includes(searchText) ||
        item.progId.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Columns for Tab 2 (一覧照会)
  const columns: ColumnsType<ProgramMasterItem> = [
    {
      title: 'サブシステム',
      dataIndex: 'subSysCd',
      key: 'subSysCd',
      width: 110,
      render: (val: string) => (
        <Tag color={SUBSYS_TAG_COLORS[val] || 'default'} style={{ fontWeight: 700, borderRadius: 6 }}>
          {val}系
        </Tag>
      ),
    },
    {
      title: 'プログラムID',
      dataIndex: 'progId',
      key: 'progId',
      width: 120,
      render: (val: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>
          {val}
        </span>
      ),
    },
    {
      title: 'プログラム名称',
      dataIndex: 'progName',
      key: 'progName',
      render: (text: string, record: ProgramMasterItem) => (
        <a
          onClick={() => handleLoadRecord(record, 'edit')}
          style={{ fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}
        >
          {text}
        </a>
      ),
    },
    {
      title: '表示行',
      dataIndex: 'gyo',
      key: 'gyo',
      width: 110,
      align: 'center',
      render: (val: number) => (
        <span style={{ fontSize: 12, color: val >= 200 ? '#7c3aed' : '#2563eb', fontWeight: 600 }}>
          {val >= 200 ? `${val} (右)` : `${val} (左)`}
        </span>
      ),
    },
    {
      title: 'Ver',
      dataIndex: 'progVer',
      key: 'progVer',
      width: 80,
      align: 'center',
      render: (val: string) => <Tag>{val}</Tag>,
    },
    {
      title: '状態',
      dataIndex: 'runBad',
      key: 'runBad',
      width: 100,
      align: 'center',
      render: (val: number) =>
        val === 0 ? (
          <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: 6 }}>
            稼働中
          </Tag>
        ) : (
          <Tag icon={<StopOutlined />} color="error" style={{ borderRadius: 6 }}>
            停止中
          </Tag>
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_: any, record: ProgramMasterItem) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleLoadRecord(record, 'edit')}
            style={{ background: '#2563eb', borderColor: '#2563eb' }}
          >
            編集
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleLoadRecord(record, 'inquiry')}
          >
            照会
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ==============================================================
          UNIFIED WORKSPACE: True Folder Index Tabs & Content Container
          ============================================================== */}
      <Tabs
        className="erp-folder-tabs"
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'form' | 'list')}
        animated={false}
        size="large"
          tabBarExtraContent={
            activeTab === 'list' ? (
              <Space size={8} wrap>
                <Tooltip title="F8キーでも実行できます">
                  <Button className="erp-tab-action-btn" icon={<PrinterOutlined />} onClick={() => setIsPrintModalOpen(true)}>
                    <span className="erp-btn-shortcut">(F8) </span>
                    <span className="erp-btn-text-mobile-hide">印刷</span>
                  </Button>
                </Tooltip>
                <Tooltip title="F6キーでも実行できます">
                  <Button className="erp-tab-action-btn" icon={<DownloadOutlined />} onClick={handleExportCsv}>
                    <span className="erp-btn-shortcut">(F6) </span>
                    <span className="erp-btn-text-mobile-hide">CSV出力</span>
                  </Button>
                </Tooltip>
                <Tooltip title="マスタデータを再取得">
                  <Button
                    className="erp-tab-action-btn"
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setData(SEED_PROGRAMS);
                      message.success('マスタデータを再取得しました。');
                    }}
                  />
                </Tooltip>
              </Space>
            ) : null
          }
          items={[
            {
              key: 'form',
              label: (
                <span className="erp-tab-label-wrap">
                  <span className="erp-tab-icon-badge form-icon">
                    <FormOutlined />
                  </span>
                  <span>登録・編集フォーム</span>
                  {mode === 'new' && (
                    <Tag color="green" style={{ margin: 0, borderRadius: 999, padding: '0 10px', fontWeight: 700 }}>
                      新規
                    </Tag>
                  )}
                  {mode === 'edit' && (
                    <Tag color="blue" style={{ margin: 0, borderRadius: 999, padding: '0 10px', fontWeight: 700 }}>
                      修正: #{currentRecord?.subSysCd}-{currentRecord?.progId}
                    </Tag>
                  )}
                  {mode === 'inquiry' && (
                    <Tag color="orange" style={{ margin: 0, borderRadius: 999, padding: '0 10px', fontWeight: 700 }}>
                      照会
                    </Tag>
                  )}
                </span>
              ),
              children: (
                /* ========================================================
                   TAB 1: COMPLETE FULL-PAGE FORM (AD1740C SPECIFICATION)
                   ======================================================== */
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={INITIAL_FORM_VALUES}
                  disabled={mode === 'inquiry'}
                  style={{ marginTop: 8 }}
                >
                  {/* Top Form Navigation & Mode Selector Bar */}
                  <div
                    className="master-top-control-bar"
                    style={{
                      background: '#f8fafc',
                      padding: '12px 18px',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      marginBottom: 20,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    <Space size={14} align="center">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Text strong className="master-control-label" style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                          処理区分:
                        </Text>
                        <Select
                          value={mode}
                          disabled={false}
                          onChange={(val) => {
                            setMode(val);
                            if (val === 'new') handleClearForm();
                          }}
                          style={{ width: 145, fontWeight: 700 }}
                          options={[
                            { value: 'new', label: '新規登録' },
                            { value: 'edit', label: 'データ修正' },
                            { value: 'inquiry', label: '照会 (閲覧)' },
                          ]}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Text strong className="master-control-label" style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                          サブシステム:
                        </Text>
                        <Form.Item name="subSysCd" noStyle rules={[{ required: true, message: 'サブシステム必須' }]}>
                          <Select
                            style={{ width: 160, fontWeight: 700 }}
                            disabled={mode !== 'new'}
                            options={[
                              { value: 'AD', label: 'AD: 管理・マスタ' },
                              { value: 'GK', label: 'GK: 原価管理' },
                              { value: 'UR', label: 'UR: 売上管理' },
                              { value: 'SR', label: 'SR: 仕入管理' },
                              { value: 'VM', label: 'VM: 月次更新' },
                            ]}
                          />
                        </Form.Item>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Text strong className="master-control-label" style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                          プログラムID:
                        </Text>
                        <Form.Item name="progId" noStyle rules={[{ required: true, message: 'ID必須' }]}>
                          <Input
                            placeholder="例: GK0010"
                            maxLength={7}
                            disabled={mode !== 'new'}
                            onBlur={handleCheckCode}
                            style={{ width: 120, fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}
                          />
                        </Form.Item>
                      </div>

                      <div>
                        {mode === 'edit' && currentRecord && (
                          <Tag color="processing" style={{ fontSize: 12, padding: '2px 8px' }}>
                            【修正モード: {currentRecord.progName}】
                          </Tag>
                        )}
                        {mode === 'new' && (
                          <Tag color="success" style={{ fontSize: 12, padding: '2px 8px' }}>
                            【新規登録モード】
                          </Tag>
                        )}
                      </div>
                    </Space>

                    {/* Sequential Navigation Buttons (F9, F10) */}
                    <Space size={8}>
                      <Button icon={<LeftOutlined />} onClick={handlePrevRecord} disabled={data.length === 0}>
                        (F9) 前データ
                      </Button>
                      <Button onClick={handleNextRecord} disabled={data.length === 0}>
                        (F10) 次データ <RightOutlined />
                      </Button>
                    </Space>
                  </div>

                  {/* 1. プログラム定義項目 */}
                  <Card
                    type="inner"
                    title={<span style={{ fontWeight: 700, color: '#1e293b' }}>1. プログラム定義情報</span>}
                    style={{ marginBottom: 16, borderRadius: 8 }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={14}>
                        <Form.Item
                          name="progName"
                          label="プログラム名称 (全角25文字以内)"
                          rules={[{ required: true, message: 'プログラム名称を入力してください' }]}
                        >
                          <Input placeholder="例: 受注先マスタ" maxLength={25} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={10}>
                        <Form.Item
                          name="gyo"
                          label="メニュー表示行 (101～: 左側, 201～: 右側)"
                          rules={[{ required: true, message: '表示行を入力してください' }]}
                        >
                          <InputNumber min={1} max={999} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} sm={8}>
                        <Form.Item name="progVer" label="バージョン番号 (Ver№)">
                          <Input placeholder="9.9.9" maxLength={10} style={{ fontFamily: 'monospace' }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Form.Item name="maxCnt" label="最大明細件数">
                          <InputNumber min={1} max={99999} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Form.Item name="runBad" label="起動可否設定">
                          <Select
                            options={[
                              { value: 0, label: '0: 起動可能 (稼働中)' },
                              { value: 1, label: '1: 起動停止 (メンテナンス中)' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>

                  {/* Audit Information Bar per AD1740C Specification */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 20,
                      fontSize: 12,
                      color: '#64748b',
                      marginBottom: 10,
                      paddingRight: 4,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      新規作成:{' '}
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                        {currentRecord ? '2024/04/01 09:00:00 (ADMIN / PC-MITSUHIDE)' : '未登録'}
                      </span>
                    </div>
                    <div>
                      最終更新:{' '}
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                        {currentRecord ? `${new Date().toLocaleDateString('ja-JP')} 11:00:00 (ADMIN / PC-MITSUHIDE)` : '未登録'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="erp-bottom-action-bar">
                    <Space size={10} wrap>
                      <Button
                        type="primary"
                        className="erp-bottom-action-btn"
                        icon={<SaveOutlined />}
                        loading={isSaving}
                        onClick={handleSave}
                        disabled={mode === 'inquiry'}
                        style={{ background: '#2563eb', borderColor: '#2563eb', fontWeight: 700 }}
                      >
                        <span className="erp-btn-shortcut">(F1) </span>登録・保存
                      </Button>
                      <Button
                        className="erp-bottom-action-btn"
                        icon={<ClearOutlined />}
                        disabled={false}
                        onClick={handleClearForm}
                        style={{ fontWeight: 600 }}
                      >
                        <span className="erp-btn-shortcut">(F2) </span>クリア
                      </Button>
                      <Button
                        className="erp-bottom-action-btn"
                        icon={<UndoOutlined />}
                        disabled={false}
                        onClick={() => {
                          if (currentRecord) form.setFieldsValue(currentRecord);
                          else handleClearForm();
                        }}
                      >
                        <span className="erp-btn-shortcut">(F11) </span>取消
                      </Button>
                    </Space>

                    <Space size={10} wrap>
                      {mode === 'edit' && currentRecord && (
                        <Popconfirm
                          title="削除の確認"
                          description={`プログラム「${currentRecord.progName} (${currentRecord.progId})」を削除しますか？`}
                          onConfirm={handleDeleteCurrent}
                          okText="削除"
                          cancelText="キャンセル"
                          okButtonProps={{ danger: true }}
                        >
                          <Button danger className="erp-bottom-action-btn" icon={<DeleteOutlined />} style={{ fontWeight: 600 }}>
                            <span className="erp-btn-shortcut">(F7) </span>削除
                          </Button>
                        </Popconfirm>
                      )}
                      <Button
                        className="erp-bottom-action-btn"
                        icon={<TableOutlined />}
                        disabled={false}
                        onClick={() => setActiveTab('list')}
                        style={{ fontWeight: 600, background: '#1e293b', color: '#fff', borderColor: '#334155' }}
                      >
                        <span className="erp-btn-shortcut">(F5) </span>一覧照会へ
                      </Button>
                    </Space>
                  </div>
                </Form>
              ),
            },
            {
              key: 'list',
              label: (
                <span className="erp-tab-label-wrap">
                  <span className="erp-tab-icon-badge list-icon">
                    <TableOutlined />
                  </span>
                  <span>データ一覧・検索</span>
                  <span className="erp-tab-count-pill">{filteredData.length} 件</span>
                </span>
              ),
              children: (
                /* ========================================================
                   TAB 2: DATABASE DATA TABLE & SEARCH (AD1740C LIST)
                   ======================================================== */
                <div style={{ marginTop: 8 }}>
                  <Row justify="space-between" align="middle" style={{ marginBottom: 16 }} gutter={[12, 12]}>
                    <Col xs={24} sm={16} md={14}>
                      <Space size={10} style={{ width: '100%' }} wrap>
                        <Select
                          value={selectedSubSys}
                          onChange={(val) => setSelectedSubSys(val)}
                          style={{ width: 170 }}
                          options={[
                            { value: 'ALL', label: 'すべてのサブシステム' },
                            { value: 'AD', label: 'AD: システム管理' },
                            { value: 'GK', label: 'GK: 原価管理' },
                            { value: 'UR', label: 'UR: 売上管理' },
                            { value: 'SR', label: 'SR: 仕入管理' },
                            { value: 'VM', label: 'VM: 月次更新' },
                          ]}
                        />
                        <Input
                          placeholder="プログラム名 / ID... (リアルタイム検索)"
                          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          allowClear
                          style={{ width: 280 }}
                        />
                      </Space>
                    </Col>

                    <Col xs={24} sm={8} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                        登録件数: <strong style={{ color: '#0f172a' }}>{filteredData.length}</strong> 件
                      </Text>
                    </Col>
                  </Row>

                  <Table
                    rowKey="progId"
                    columns={columns}
                    dataSource={filteredData}
                    scroll={{ x: 800 }}
                    pagination={{ pageSize: 15 }}
                    bordered
                    size="middle"
                    onRow={(record) => ({
                      onDoubleClick: () => handleLoadRecord(record, 'edit'),
                    })}
                  />
                </div>
              ),
            },
          ]}
        />

      {/* ========================================================
          MODAL: PRINT SPECIFICATION (AD1740C 印刷指定 - F8)
          ======================================================== */}
      <Modal
        title={
          <Space>
            <PrinterOutlined style={{ color: '#0284c7' }} />
            <span style={{ fontWeight: 700 }}>■ 印刷指定 (AD1740C プログラムマスタ一覧表)</span>
          </Space>
        }
        open={isPrintModalOpen}
        onCancel={() => setIsPrintModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsPrintModalOpen(false)}>
            キャンセル
          </Button>,
          <Button
            key="csv"
            icon={<DownloadOutlined />}
            onClick={() => {
              handleExportCsv();
              setIsPrintModalOpen(false);
            }}
          >
            CSVダウンロード
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => {
              setIsPrintModalOpen(false);
              window.print();
            }}
            style={{ background: '#0284c7', borderColor: '#0284c7' }}
          >
            印刷プレビュー (F8)
          </Button>,
        ]}
      >
        <div style={{ padding: '12px 0' }}>
          <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
            登録されている全サブシステムのプログラムマスタ定義一覧を印刷プレビューで表示します。
          </p>
        </div>
      </Modal>
    </div>
  );
};
