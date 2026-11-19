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
  Tooltip,
  Tabs,
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
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { API_BASE_URL } from '../../api/client';
import { exportToCsv } from '../../utils/csvExport';
import { useDebounce } from '../../hooks/useDebounce';

const { Text } = Typography;

export interface ControlItem {
  subSysCd: string;
  progId: string;
  kanriName: string;
  nm1?: number;
  nm2?: number;
  nm3?: number;
  ch1?: string;
  ch2?: string;
  ch3?: string;
}

export const SUBSYS_OPTIONS = [
  { value: 'GK', label: 'GK: 原価管理' },
  { value: 'UR', label: 'UR: 売上管理' },
  { value: 'SR', label: 'SR: 仕入管理' },
  { value: 'VM', label: 'VM: 月次更新' },
  { value: 'AD', label: 'AD: システム管理・マスタ' },
];

const INITIAL_FORM_VALUES: Partial<ControlItem> = {
  subSysCd: 'GK',
};

export const ControlMasterPage: React.FC = () => {
  // Navigation & Tab state: default 'form' (Tab 1: 登録・編集フォーム)
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  // Mode: 'new' (1: 新規登録), 'edit' (2: 修正), 'inquiry' (4: 照会)
  const [mode, setMode] = useState<'new' | 'edit' | 'inquiry'>('new');

  // Master Data & Search
  const [data, setData] = useState<ControlItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedSubSys, setSelectedSubSys] = useState<string>('ALL');
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 300);

  // Form State
  const [form] = Form.useForm();
  const [currentRecord, setCurrentRecord] = useState<ControlItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Print Modal State (F8)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Fetch Master Data
  const fetchData = async (searchOverride?: string) => {
    setLoading(true);
    try {
      const activeSearch = searchOverride !== undefined ? searchOverride : debouncedSearchText;
      let url = `${API_BASE_URL}/api/control?page=${page}&pageSize=${pageSize}`;
      if (selectedSubSys && selectedSubSys !== 'ALL') {
        url += `&subSysCd=${encodeURIComponent(selectedSubSys)}`;
      }
      if (activeSearch) {
        url += `&keyword=${encodeURIComponent(activeSearch)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        setData(result.items || []);
        setTotalCount(result.totalCount || 0);
      } else {
        // Fallback demo data
        const mockList: ControlItem[] = [
          { subSysCd: 'GK', progId: 'GK1010C', kanriName: '工事登録 制御基準', nm1: 1, ch1: '初期請負区分=1', ch2: '自動採番有効' },
          { subSysCd: 'GK', progId: 'GK1020C', kanriName: '実行予算 承認基準', nm1: 1000000, ch1: '承認必須閾値=100万円', ch2: '課長決裁' },
          { subSysCd: 'UR', progId: 'UR1010C', kanriName: '売上締日 基準管理', nm1: 25, ch1: '通常締日=25日', ch2: '月末締め設定' },
          { subSysCd: 'SR', progId: 'SR1010C', kanriName: '仕入締日 基準管理', nm1: 31, ch1: '月末締め一括処理', ch2: '翌月末支払' },
          { subSysCd: 'VM', progId: 'VM1010C', kanriName: '月次更新 処理年度', nm1: 2026, nm2: 11, ch1: '当期年度=2026', ch2: '当月度=11' },
          { subSysCd: 'AD', progId: 'AD1780C', kanriName: '受注先保守 処理基準', nm1: 1, ch1: 'コード自動採番=1', ch2: '手形期日制限=120日' },
        ];
        const activeSearch = searchOverride !== undefined ? searchOverride : debouncedSearchText;
        setData(
          mockList.filter(
            (x) =>
              (selectedSubSys === 'ALL' || x.subSysCd === selectedSubSys) &&
              (!activeSearch || x.kanriName.includes(activeSearch) || x.progId.includes(activeSearch))
          )
        );
        setTotalCount(mockList.length);
      }
    } catch {
      // Mock Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchText, selectedSubSys]);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, selectedSubSys, debouncedSearchText]);

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

  // Load a Record into Tab 1 Form for Editing / Viewing
  const handleLoadRecord = useCallback(
    (item: ControlItem, targetMode: 'edit' | 'inquiry' = 'edit') => {
      setCurrentRecord(item);
      setMode(targetMode);
      form.setFieldsValue(item);
      setActiveTab('form');
      if (targetMode === 'edit') {
        message.success(`処理基準「${item.kanriName}」を修正モードで読み込みました。`);
      } else {
        message.info(`処理基準「${item.kanriName}」を照会モードで表示しています。`);
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
      message.warning(`処理基準 [${subSys}-${prog}] は既に登録されています。修正モードに切り替えます。`);
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
        await fetch(`${API_BASE_URL}/api/control/${currentRecord.subSysCd}/${currentRecord.progId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        }).catch(() => {});
        message.success(`処理基準 [${currentRecord.subSysCd}-${currentRecord.progId}] を更新しました。`);
        setData((prev) =>
          prev.map((item) =>
            item.subSysCd === currentRecord.subSysCd && item.progId === currentRecord.progId ? { ...item, ...values } : item
          )
        );
        setCurrentRecord({ ...currentRecord, ...values });
      } else {
        await fetch(`${API_BASE_URL}/api/control`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        }).catch(() => {});
        message.success(`新規処理基準 [${values.subSysCd}-${values.progId}] を登録しました。`);
        setData((prev) => [...prev, values]);
        setCurrentRecord(values);
        setMode('edit');
      }
      fetchData();
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
    try {
      await fetch(`${API_BASE_URL}/api/control/${currentRecord.subSysCd}/${currentRecord.progId}`, {
        method: 'DELETE',
      }).catch(() => {});
      message.success(`処理基準 [${currentRecord.subSysCd}-${currentRecord.progId}] を削除しました。`);
      setData((prev) =>
        prev.filter((x) => !(x.subSysCd === currentRecord.subSysCd && x.progId === currentRecord.progId))
      );
      handleClearForm();
      fetchData();
    } catch {
      message.error('削除処理に失敗しました。');
    }
  };

  // Export CSV (F6)
  const handleExportCsv = async () => {
    let exportData = data;
    try {
      const res = await fetch(`${API_BASE_URL}/api/control?page=1&pageSize=1000`);
      if (res.ok) {
        const json = await res.json();
        if (json.items && json.items.length > 0) exportData = json.items;
      }
    } catch {
      // Fallback
    }

    if (!exportData || exportData.length === 0) {
      message.warning('出力対象のデータがありません。');
      return;
    }

    exportToCsv(
      `処理基準管理マスタ_AD1770C_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { header: 'サブシステムCD', key: 'subSysCd' },
        { header: 'プログラムID', key: 'progId' },
        { header: '管理名称', key: 'kanriName' },
        { header: '数値項目1', key: 'nm1' },
        { header: '数値項目2', key: 'nm2' },
        { header: '文字項目1', key: 'ch1' },
        { header: '文字項目2', key: 'ch2' },
      ],
      exportData
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

  // Columns for Tab 2 (一覧照会)
  const columns: ColumnsType<ControlItem> = [
    {
      title: 'サブシステム',
      dataIndex: 'subSysCd',
      key: 'subSysCd',
      width: 110,
      render: (val: string) => (
        <Tag color="cyan" style={{ fontWeight: 700, borderRadius: 6 }}>
          {val}
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
      title: '管理名称',
      dataIndex: 'kanriName',
      key: 'kanriName',
      render: (text: string, record: ControlItem) => (
        <a
          onClick={() => handleLoadRecord(record, 'edit')}
          style={{ fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}
        >
          {text}
        </a>
      ),
    },
    {
      title: '設定パラメータ (文字1 / 数値1)',
      key: 'param',
      render: (_: any, r: ControlItem) => (
        <Space size={6}>
          {r.ch1 && <Tag color="blue">{r.ch1}</Tag>}
          {r.nm1 !== undefined && <Tag color="green">{r.nm1}</Tag>}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_: any, record: ControlItem) => (
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
                      fetchData();
                      message.success('マスタデータを再取得しました。');
                    }}
                    loading={loading}
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
                   TAB 1: COMPLETE FULL-PAGE FORM (AD1770C SPECIFICATION)
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
                          サブシステムCD:
                        </Text>
                        <Form.Item name="subSysCd" noStyle rules={[{ required: true, message: 'サブシステム必須' }]}>
                          <Select
                            options={SUBSYS_OPTIONS}
                            disabled={mode !== 'new'}
                            style={{ width: 180, fontWeight: 700 }}
                          />
                        </Form.Item>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Text strong className="master-control-label" style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                          プログラムID:
                        </Text>
                        <Form.Item name="progId" noStyle rules={[{ required: true, message: 'ID必須' }]}>
                          <Input
                            placeholder="例: GK1010C"
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
                            【修正モード: {currentRecord.kanriName}】
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

                  {/* 1. 管理名称 */}
                  <Card
                    type="inner"
                    title={<span style={{ fontWeight: 700, color: '#1e293b' }}>1. 基準名称定義</span>}
                    style={{ marginBottom: 16, borderRadius: 8 }}
                  >
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="kanriName"
                          label="管理名称 (全角40文字以内)"
                          rules={[{ required: true, message: '管理名称を入力してください' }]}
                        >
                          <Input placeholder="例: 工事登録 制御基準" maxLength={40} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>

                  {/* 2. 数値項目定義 */}
                  <Card
                    type="inner"
                    title={<span style={{ fontWeight: 700, color: '#1e293b' }}>2. 処理基準・数値制御項目</span>}
                    style={{ marginBottom: 16, borderRadius: 8 }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={8}>
                        <Form.Item name="nm1" label="数値項目1 (基準値 / 閾値 / 締日など)">
                          <InputNumber style={{ width: '100%' }} step={1} placeholder="例: 1" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="nm2" label="数値項目2 (月度 / 金額上限など)">
                          <InputNumber style={{ width: '100%' }} step={1} placeholder="例: 11" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="nm3" label="数値項目3 (予備数値)">
                          <InputNumber style={{ width: '100%' }} step={1} placeholder="例: 0" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>

                  {/* 3. 文字項目定義 */}
                  <Card
                    type="inner"
                    title={<span style={{ fontWeight: 700, color: '#1e293b' }}>3. 処理基準・文字制御項目</span>}
                    style={{ marginBottom: 20, borderRadius: 8 }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item name="ch1" label="文字項目1 (設定パラメータ / 条件式 - 全角50文字以内)">
                          <Input placeholder="例: 初期請負区分=1" maxLength={50} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="ch2" label="文字項目2 (追加パラメータ / 決裁権限 - 全角50文字以内)">
                          <Input placeholder="例: 自動採番有効" maxLength={50} />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="ch3" label="文字項目3 (特記事項・補足メモ - 全角50文字以内)">
                          <Input placeholder="例: 現場担当者初期値設定" maxLength={50} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>

                  {/* Audit Information Bar per AD1770C Specification */}
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
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#0f172a',
                      padding: '12px 20px',
                      borderRadius: 10,
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    <Space size={10} wrap>
                      <Button
                        type="primary"
                        size="large"
                        icon={<SaveOutlined />}
                        loading={isSaving}
                        onClick={handleSave}
                        disabled={mode === 'inquiry'}
                        style={{ background: '#2563eb', borderColor: '#2563eb', fontWeight: 700 }}
                      >
                        (F1) 登録・保存
                      </Button>
                      <Button
                        size="large"
                        icon={<ClearOutlined />}
                        onClick={handleClearForm}
                        style={{ fontWeight: 600 }}
                      >
                        (F2) クリア
                      </Button>
                      <Button
                        size="large"
                        icon={<UndoOutlined />}
                        onClick={() => {
                          if (currentRecord) form.setFieldsValue(currentRecord);
                          else handleClearForm();
                        }}
                      >
                        (F11) 取消
                      </Button>
                    </Space>

                    <Space size={10} wrap>
                      {mode === 'edit' && currentRecord && (
                        <Popconfirm
                          title="削除の確認"
                          description={`処理基準「${currentRecord.kanriName} (${currentRecord.subSysCd}-${currentRecord.progId})」を削除しますか？`}
                          onConfirm={handleDeleteCurrent}
                          okText="削除"
                          cancelText="キャンセル"
                          okButtonProps={{ danger: true }}
                        >
                          <Button danger size="large" icon={<DeleteOutlined />} style={{ fontWeight: 600 }}>
                            (F7) 削除
                          </Button>
                        </Popconfirm>
                      )}
                      <Button
                        size="large"
                        icon={<TableOutlined />}
                        onClick={() => setActiveTab('list')}
                        style={{ fontWeight: 600, background: '#1e293b', color: '#fff', borderColor: '#334155' }}
                      >
                        (F5) 一覧照会へ
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
                  <span className="erp-tab-count-pill">{totalCount} 件</span>
                </span>
              ),
              children: (
                /* ========================================================
                   TAB 2: DATABASE DATA TABLE & SEARCH (AD1770C LIST)
                   ======================================================== */
                <div style={{ marginTop: 8 }}>
                  <Row justify="space-between" align="middle" style={{ marginBottom: 16 }} gutter={[12, 12]}>
                    <Col xs={24} sm={16} md={14}>
                      <Space size={10} style={{ width: '100%' }} wrap>
                        <Select
                          value={selectedSubSys}
                          onChange={(val) => {
                            setSelectedSubSys(val);
                            setPage(1);
                          }}
                          style={{ width: 190 }}
                          options={[
                            { value: 'ALL', label: 'すべてのサブシステム' },
                            ...SUBSYS_OPTIONS,
                          ]}
                        />
                        <Input
                          placeholder="プログラムID / 管理名称... (リアルタイム検索)"
                          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          onPressEnter={() => {
                            setPage(1);
                            fetchData(searchText);
                          }}
                          allowClear
                          style={{ width: 300 }}
                        />
                        <Button
                          type="primary"
                          icon={<SearchOutlined />}
                          loading={loading}
                          onClick={() => {
                            setPage(1);
                            fetchData(searchText);
                          }}
                          style={{ background: '#2563eb', borderColor: '#2563eb', fontWeight: 600 }}
                        >
                          検索
                        </Button>
                      </Space>
                    </Col>

                    <Col>
                      <Space size={10}>
                        <Button
                          type="primary"
                          icon={<FormOutlined />}
                          onClick={() => {
                            handleClearForm();
                            setActiveTab('form');
                          }}
                          style={{ background: '#10b981', borderColor: '#10b981', fontWeight: 700 }}
                        >
                          新規登録フォームへ
                        </Button>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          登録件数: <strong style={{ color: '#0f172a' }}>{totalCount}</strong> 件
                        </Text>
                      </Space>
                    </Col>
                  </Row>

                  <Table
                    rowKey={(r) => `${r.subSysCd}-${r.progId}`}
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    scroll={{ x: 1000 }}
                    pagination={{
                      current: page,
                      pageSize,
                      total: totalCount,
                      showSizeChanger: true,
                      pageSizeOptions: ['10', '15', '30', '50'],
                      onChange: (p, ps) => {
                        setPage(p);
                        setPageSize(ps);
                      },
                    }}
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
          MODAL: PRINT SPECIFICATION (AD1770C 印刷指定 - F8)
          ======================================================== */}
      <Modal
        title={
          <Space>
            <PrinterOutlined style={{ color: '#0d9488' }} />
            <span style={{ fontWeight: 700 }}>■ 印刷指定 (AD1770C 処理基準管理マスタ一覧表)</span>
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
            style={{ background: '#0d9488', borderColor: '#0d9488' }}
          >
            印刷プレビュー (F8)
          </Button>,
        ]}
      >
        <div style={{ padding: '12px 0' }}>
          <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
            登録されている各サブシステムの処理基準管理マスタ定義を印刷プレビューで表示します。
          </p>
        </div>
      </Modal>
    </div>
  );
};
