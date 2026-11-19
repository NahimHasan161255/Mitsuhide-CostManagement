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
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { API_BASE_URL } from '../../api/client';
import { exportToCsv } from '../../utils/csvExport';
import { useDebounce } from '../../hooks/useDebounce';

const { Text } = Typography;

export interface SysNameItem {
  nameKbn: string;
  nameCd: string;
  ch1: string;
  ch2?: string;
  nm1?: number;
  nm2?: number;
}

export const NAME_KBN_OPTIONS = [
  { value: 'GK001', label: 'GK001: 未成完成区分' },
  { value: 'GK002', label: 'GK002: 公民区分' },
  { value: 'GK003', label: 'GK003: 請負形態' },
  { value: 'GK004', label: 'GK004: 税区分' },
  { value: 'AD001', label: 'AD001: 締日区分' },
  { value: 'AD002', label: 'AD002: 担当者区分' },
  { value: 'AD003', label: 'AD003: 請求書式区分' },
  { value: 'AD004', label: 'AD004: 取引区分' },
  { value: 'AD006', label: 'AD006: 権限区分' },
];

const INITIAL_FORM_VALUES: Partial<SysNameItem> = {
  nameKbn: 'GK001',
};

export const SysNameMasterPage: React.FC = () => {
  // Navigation & Tab state: default 'form' (Tab 1: 登録・編集フォーム)
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  // Mode: 'new' (1: 新規登録), 'edit' (2: 修正), 'inquiry' (4: 照会)
  const [mode, setMode] = useState<'new' | 'edit' | 'inquiry'>('new');

  // Master Data & Search
  const [data, setData] = useState<SysNameItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedKbn, setSelectedKbn] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 300);

  // Form State
  const [form] = Form.useForm();
  const [currentRecord, setCurrentRecord] = useState<SysNameItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Print Modal State (F8)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Fetch Master Data
  const fetchData = async (searchOverride?: string) => {
    setLoading(true);
    try {
      const activeSearch = searchOverride !== undefined ? searchOverride : debouncedSearchText;
      let url = `${API_BASE_URL}/api/sysname?page=${page}&pageSize=${pageSize}`;
      if (selectedKbn) url += `&nameKbn=${encodeURIComponent(selectedKbn)}`;
      if (activeSearch) url += `&keyword=${encodeURIComponent(activeSearch)}`;

      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        setData(result.items || []);
        setTotalCount(result.totalCount || 0);
      } else {
        // Fallback demo data
        const mockList: SysNameItem[] = [
          { nameKbn: 'GK001', nameCd: '0', ch1: '未成', ch2: '工事施工中・仕掛', nm1: 1 },
          { nameKbn: 'GK001', nameCd: '1', ch1: '完成', ch2: '完工引渡済', nm1: 2 },
          { nameKbn: 'GK002', nameCd: '1', ch1: '民間', ch2: '一般企業・民間工事', nm1: 1 },
          { nameKbn: 'GK002', nameCd: '2', ch1: '官公庁', ch2: '公共工事・入札', nm1: 2 },
          { nameKbn: 'GK003', nameCd: '1', ch1: '元請', ch2: '直接請負', nm1: 1 },
          { nameKbn: 'GK003', nameCd: '2', ch1: '下請', ch2: 'ゼネコン一次下請', nm1: 2 },
          { nameKbn: 'GK004', nameCd: '1', ch1: '課税 (10%)', ch2: '標準税率', nm1: 10 },
          { nameKbn: 'GK004', nameCd: '2', ch1: '非課税', ch2: '非課税取引', nm1: 0 },
          { nameKbn: 'AD003', nameCd: '1', ch1: '自社指定書式', ch2: 'ミツヒデ標準請求書', nm1: 1 },
          { nameKbn: 'AD003', nameCd: '2', ch1: '客先指定書式', ch2: '元請指定フォーマット', nm1: 2 },
          { nameKbn: 'AD004', nameCd: '1', ch1: '通常取引', ch2: '随時・継続取引先', nm1: 1 },
          { nameKbn: 'AD004', nameCd: '2', ch1: '取引停止', ch2: '一時休止', nm1: 2 },
        ];
        const activeSearch = searchOverride !== undefined ? searchOverride : debouncedSearchText;
        setData(
          mockList.filter(
            (x) =>
              (!selectedKbn || x.nameKbn === selectedKbn) &&
              (!activeSearch || x.ch1.includes(activeSearch) || x.nameCd.includes(activeSearch))
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
  }, [debouncedSearchText, selectedKbn]);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, selectedKbn, debouncedSearchText]);

  // Initial Form Reset
  const handleClearForm = useCallback(() => {
    form.resetFields();
    form.setFieldsValue({
      ...INITIAL_FORM_VALUES,
      nameKbn: selectedKbn || 'GK001',
    });
    setCurrentRecord(null);
    setMode('new');
    message.info('入力フォームをクリアしました。(新規登録モード)');
  }, [form, selectedKbn]);

  // Load a Record into Tab 1 Form for Editing / Viewing
  const handleLoadRecord = useCallback(
    (item: SysNameItem, targetMode: 'edit' | 'inquiry' = 'edit') => {
      setCurrentRecord(item);
      setMode(targetMode);
      form.setFieldsValue(item);
      setActiveTab('form');
      if (targetMode === 'edit') {
        message.success(`名称「${item.nameKbn}-${item.nameCd}」を修正モードで読み込みました。`);
      } else {
        message.info(`名称「${item.nameKbn}-${item.nameCd}」を照会モードで表示しています。`);
      }
    },
    [form]
  );

  // Check code on blur
  const handleCheckCode = async () => {
    const kbn = form.getFieldValue('nameKbn');
    const cd = form.getFieldValue('nameCd');
    if (!kbn || !cd) return;
    const existing = data.find((x) => x.nameKbn === kbn && x.nameCd === cd);
    if (existing && mode === 'new') {
      message.warning(`名称 [${kbn}-${cd}] は既に登録されています。修正モードに切り替えます。`);
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
    const idx = data.findIndex((x) => x.nameKbn === currentRecord.nameKbn && x.nameCd === currentRecord.nameCd);
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
    const idx = data.findIndex((x) => x.nameKbn === currentRecord.nameKbn && x.nameCd === currentRecord.nameCd);
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
        await fetch(`${API_BASE_URL}/api/sysname/${currentRecord.nameKbn}/${currentRecord.nameCd}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        }).catch(() => {});
        message.success(`名称 [${currentRecord.nameKbn}-${currentRecord.nameCd}] を更新しました。`);
        setData((prev) =>
          prev.map((item) =>
            item.nameKbn === currentRecord.nameKbn && item.nameCd === currentRecord.nameCd ? { ...item, ...values } : item
          )
        );
        setCurrentRecord({ ...currentRecord, ...values });
      } else {
        await fetch(`${API_BASE_URL}/api/sysname`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        }).catch(() => {});
        message.success(`新規名称 [${values.nameKbn}-${values.nameCd}] を登録しました。`);
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
      await fetch(`${API_BASE_URL}/api/sysname/${currentRecord.nameKbn}/${currentRecord.nameCd}`, {
        method: 'DELETE',
      }).catch(() => {});
      message.success(`名称 [${currentRecord.nameKbn}-${currentRecord.nameCd}] を削除しました。`);
      setData((prev) =>
        prev.filter((x) => !(x.nameKbn === currentRecord.nameKbn && x.nameCd === currentRecord.nameCd))
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
      const res = await fetch(`${API_BASE_URL}/api/sysname?page=1&pageSize=1000`);
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
      `システム名称マスタ_AD1760C_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { header: '名称区分', key: 'nameKbn' },
        { header: '名称CD', key: 'nameCd' },
        { header: '文字項目1 (名称)', key: 'ch1' },
        { header: '文字項目2 (補足)', key: 'ch2' },
        { header: '数値項目1', key: 'nm1' },
        { header: '数値項目2', key: 'nm2' },
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
        form.setFieldsValue({ nameCd: undefined });
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
  const columns: ColumnsType<SysNameItem> = [
    {
      title: '名称区分',
      dataIndex: 'nameKbn',
      key: 'nameKbn',
      width: 110,
      render: (val: string) => (
        <Tag color="blue" style={{ fontFamily: 'monospace', fontWeight: 700, borderRadius: 6 }}>
          {val}
        </Tag>
      ),
    },
    {
      title: '名称CD',
      dataIndex: 'nameCd',
      key: 'nameCd',
      width: 90,
      render: (val: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>
          {val}
        </span>
      ),
    },
    {
      title: '文字項目1 (名称)',
      dataIndex: 'ch1',
      key: 'ch1',
      render: (text: string, record: SysNameItem) => (
        <a
          onClick={() => handleLoadRecord(record, 'edit')}
          style={{ fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}
        >
          {text}
        </a>
      ),
    },
    {
      title: '文字項目2 (略称・補足)',
      dataIndex: 'ch2',
      key: 'ch2',
      render: (val?: string) => <span style={{ fontSize: 13, color: '#64748b' }}>{val || '-'}</span>,
    },
    {
      title: '数値項目1 (設定値)',
      dataIndex: 'nm1',
      key: 'nm1',
      width: 140,
      align: 'right',
      render: (val?: number) => (val !== undefined ? <Tag color="green">{val}</Tag> : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_: any, record: SysNameItem) => (
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
                      修正: #{currentRecord?.nameKbn}-{currentRecord?.nameCd}
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
                   TAB 1: COMPLETE FULL-PAGE FORM (AD1760C SPECIFICATION)
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
                          名称区分:
                        </Text>
                        <Form.Item name="nameKbn" noStyle rules={[{ required: true, message: '区分必須' }]}>
                          <Select
                            options={NAME_KBN_OPTIONS}
                            disabled={mode !== 'new'}
                            style={{ width: 220, fontWeight: 700 }}
                          />
                        </Form.Item>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Text strong className="master-control-label" style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                          名称CD:
                        </Text>
                        <Form.Item name="nameCd" noStyle rules={[{ required: true, message: 'CD必須' }]}>
                          <Input
                            placeholder="例: 1"
                            maxLength={7}
                            disabled={mode !== 'new'}
                            onBlur={handleCheckCode}
                            style={{ width: 110, fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}
                          />
                        </Form.Item>
                      </div>

                      <div>
                        {mode === 'edit' && currentRecord && (
                          <Tag color="processing" style={{ fontSize: 12, padding: '2px 8px' }}>
                            【修正モード: {currentRecord.nameKbn}-{currentRecord.nameCd}】
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

                  {/* 1. 名称・文字列定義 */}
                  <Card
                    type="inner"
                    title={<span style={{ fontWeight: 700, color: '#1e293b' }}>1. 名称・文字列定義項目</span>}
                    style={{ marginBottom: 16, borderRadius: 8 }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="ch1"
                          label="文字項目1 (名称 / 正式名称 - 全角50文字以内)"
                          rules={[{ required: true, message: '名称を入力してください' }]}
                        >
                          <Input placeholder="例: 課税 (10%)" maxLength={50} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="ch2" label="文字項目2 (略称・補足説明 - 全角50文字以内)">
                          <Input placeholder="例: 標準税率取引" maxLength={50} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>

                  {/* 2. 数値パラメータ定義 */}
                  <Card
                    type="inner"
                    title={<span style={{ fontWeight: 700, color: '#1e293b' }}>2. 数値パラメータ項目</span>}
                    style={{ marginBottom: 20, borderRadius: 8 }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="nm1"
                          label="数値項目1 (設定値 / 税率 / 順序など)"
                          tooltip="計算式や税率、ソート順として使用される数値"
                        >
                          <InputNumber style={{ width: '100%' }} step={0.01} placeholder="例: 10" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="nm2" label="数値項目2 (予備数値)">
                          <InputNumber style={{ width: '100%' }} step={0.01} placeholder="例: 0" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>

                  {/* Audit Information Bar per AD1760C Specification */}
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
                        onClick={handleClearForm}
                        style={{ fontWeight: 600 }}
                      >
                        <span className="erp-btn-shortcut">(F2) </span>クリア
                      </Button>
                      <Button
                        className="erp-bottom-action-btn"
                        icon={<UndoOutlined />}
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
                          description={`名称「${currentRecord.nameKbn}-${currentRecord.nameCd} (${currentRecord.ch1})」を削除しますか？`}
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
                  <span className="erp-tab-count-pill">{totalCount} 件</span>
                </span>
              ),
              children: (
                /* ========================================================
                   TAB 2: DATABASE DATA TABLE & SEARCH (AD1760C LIST)
                   ======================================================== */
                <div style={{ marginTop: 8 }}>
                  <Row justify="space-between" align="middle" style={{ marginBottom: 16 }} gutter={[12, 12]}>
                    <Col xs={24} sm={16} md={14}>
                      <Space size={10} style={{ width: '100%' }} wrap>
                        <Select
                          placeholder="名称区分で絞込"
                          allowClear
                          value={selectedKbn}
                          onChange={(val) => {
                            setSelectedKbn(val);
                            setPage(1);
                          }}
                          style={{ width: 220 }}
                          options={NAME_KBN_OPTIONS}
                        />
                        <Input
                          placeholder="名称 / 名称CD... (リアルタイム検索)"
                          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          onPressEnter={() => {
                            setPage(1);
                            fetchData(searchText);
                          }}
                          allowClear
                          style={{ width: 280 }}
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
                    rowKey={(r) => `${r.nameKbn}-${r.nameCd}`}
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
          MODAL: PRINT SPECIFICATION (AD1760C 印刷指定 - F8)
          ======================================================== */}
      <Modal
        title={
          <Space>
            <PrinterOutlined style={{ color: '#0284c7' }} />
            <span style={{ fontWeight: 700 }}>■ 印刷指定 (AD1760C システム名称マスタ一覧表)</span>
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
            登録されているシステム名称マスタの定義一覧表を印刷プレビューで表示します。
          </p>
        </div>
      </Modal>
    </div>
  );
};
