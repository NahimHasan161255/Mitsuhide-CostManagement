import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Row,
  Col,
  Input,
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
  QuestionCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { exportToCsv } from '../../utils/csvExport';

const { Text } = Typography;

export interface MessageMasterItem {
  msgNo: string;
  msg1: string;
  msg2?: string;
  subSysCd: string;
  botanKbn: number; // 1: はい/OK, 2: いいえ
}

// Seed Messages extracted directly from official sheet (01 コード仕様書（●メッセージマスタ登録シート.xlsx)
const SEED_MESSAGES: MessageMasterItem[] = [
  { msgNo: '00001', msg1: '正常終了しました。', msg2: '処理が正常に完了しました。', subSysCd: '共通', botanKbn: 1 },
  { msgNo: '00002', msg1: '終了しました。', msg2: '', subSysCd: '共通', botanKbn: 1 },
  { msgNo: '00003', msg1: 'ＣＳＶ出力が完了しました。', msg2: '', subSysCd: '共通', botanKbn: 1 },
  { msgNo: '00004', msg1: 'ＰＤＦ出力が完了しました。', msg2: '', subSysCd: '共通', botanKbn: 1 },
  { msgNo: '00070', msg1: 'パスワードが変更されました。', msg2: '次回ログオンより新パスワードが適用されます。', subSysCd: '共通', botanKbn: 1 },
  { msgNo: '01001', msg1: '登録しますか？', msg2: '入力内容をデータベースに保存します。', subSysCd: '共通', botanKbn: 1 },
  { msgNo: '01002', msg1: '検索しますか？', msg2: '指定条件で検索を実行します。', subSysCd: '共通', botanKbn: 1 },
  { msgNo: '01003', msg1: '条件訂正しますか？', msg2: 'ヘッダ検索条件部に戻ります。', subSysCd: '共通', botanKbn: 1 },
  { msgNo: '01004', msg1: 'マスタ検索しますか？', msg2: '関連マスタ検索画面を表示します。', subSysCd: '共通', botanKbn: 1 },
  { msgNo: '01005', msg1: 'ＣＳＶ出力しますか？', msg2: 'ファイル出力処理を実行します。', subSysCd: '共通', botanKbn: 1 },
  { msgNo: '01006', msg1: '削除しますか？', msg2: 'この操作は取り消せません。本当によろしいですか？', subSysCd: '共通', botanKbn: 2 },
  { msgNo: '01007', msg1: '印刷しますか？', msg2: '帳票プレビューまたは印刷を実行します。', subSysCd: '共通', botanKbn: 1 },
  { msgNo: '02086', msg1: '月次更新（仮締）が行われていません。', msg2: '対象年月の月次仮締めを実行してください。(AD1010C仕様)', subSysCd: 'MS', botanKbn: 1 },
  { msgNo: '02087', msg1: '月次更新（本締）が行われていません。', msg2: '対象年月の月次本締めを実行してください。(AD1010C仕様)', subSysCd: 'MS', botanKbn: 1 },
  { msgNo: '03001', msg1: '入力項目にエラーがあります。', msg2: '必須項目の未入力またはフォーマットを確認してください。', subSysCd: '共通', botanKbn: 1 },
  { msgNo: '03002', msg1: '対象データが存在しません。', msg2: '指定されたコードのデータが見つかりませんでした。', subSysCd: '共通', botanKbn: 1 },
  { msgNo: '03003', msg1: '既に登録されています。', msg2: '一意キーが重複しているため登録できません。', subSysCd: '共通', botanKbn: 1 },
  { msgNo: '03004', msg1: '権限がありません。', msg2: 'このプログラムの実行権限がグループに割り当てられていません。', subSysCd: '共通', botanKbn: 1 },
];

const getMsgCategoryTag = (msgNo: string) => {
  const num = parseInt(msgNo, 10);
  if (num < 1000) {
    return (
      <Tag color="success" icon={<CheckCircleOutlined />} style={{ borderRadius: 6 }}>
        正常終了 (00000)
      </Tag>
    );
  } else if (num < 2000) {
    return (
      <Tag color="processing" icon={<QuestionCircleOutlined />} style={{ borderRadius: 6 }}>
        確認メッセージ (01000)
      </Tag>
    );
  } else if (num < 3000) {
    return (
      <Tag color="warning" icon={<WarningOutlined />} style={{ borderRadius: 6 }}>
        警告メッセージ (02000)
      </Tag>
    );
  } else {
    return (
      <Tag color="error" icon={<CloseCircleOutlined />} style={{ borderRadius: 6 }}>
        エラー (03000)
      </Tag>
    );
  }
};

const INITIAL_FORM_VALUES: Partial<MessageMasterItem> = {
  subSysCd: '共通',
  botanKbn: 1,
};

export const MessageMasterPage: React.FC = () => {
  // Navigation & Tab state: default 'form' (Tab 1: 登録・編集フォーム)
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  // Mode: 'new' (1: 新規登録), 'edit' (2: 修正), 'inquiry' (4: 照会)
  const [mode, setMode] = useState<'new' | 'edit' | 'inquiry'>('new');

  // Master Data & Search
  const [data, setData] = useState<MessageMasterItem[]>(SEED_MESSAGES);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchText, setSearchText] = useState('');

  // Form State
  const [form] = Form.useForm();
  const [currentRecord, setCurrentRecord] = useState<MessageMasterItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Print Modal State (F8)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Initial Form Reset
  const handleClearForm = useCallback(() => {
    form.resetFields();
    form.setFieldsValue(INITIAL_FORM_VALUES);
    setCurrentRecord(null);
    setMode('new');
    message.info('入力フォームをクリアしました。(新規登録モード)');
  }, [form]);

  // Load Record into Form
  const handleLoadRecord = useCallback(
    (item: MessageMasterItem, targetMode: 'edit' | 'inquiry' = 'edit') => {
      setCurrentRecord(item);
      setMode(targetMode);
      form.setFieldsValue(item);
      setActiveTab('form');
      if (targetMode === 'edit') {
        message.success(`メッセージ「No.${item.msgNo}」を修正モードで読み込みました。`);
      } else {
        message.info(`メッセージ「No.${item.msgNo}」を照会モードで表示しています。`);
      }
    },
    [form]
  );

  // Check code on blur
  const handleCheckCode = async (msgNoVal: string | undefined) => {
    if (!msgNoVal) return;
    const padded = msgNoVal.padStart(5, '0');
    form.setFieldsValue({ msgNo: padded });
    const existing = data.find((x) => x.msgNo === padded);
    if (existing && mode === 'new') {
      message.warning(`メッセージ番号 ${padded} は既に登録されています。修正モードに切り替えます。`);
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
    const idx = data.findIndex((x) => x.msgNo === currentRecord.msgNo);
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
    const idx = data.findIndex((x) => x.msgNo === currentRecord.msgNo);
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
      const paddedNo = String(values.msgNo).padStart(5, '0');
      const itemToSave = { ...values, msgNo: paddedNo };

      if (mode === 'edit' && currentRecord) {
        setData((prev) =>
          prev.map((item) => (item.msgNo === currentRecord.msgNo ? { ...item, ...itemToSave } : item))
        );
        setCurrentRecord({ ...currentRecord, ...itemToSave });
        message.success(`メッセージ [${paddedNo}] を更新しました。`);
      } else {
        setData((prev) => [...prev, itemToSave]);
        setCurrentRecord(itemToSave);
        setMode('edit');
        message.success(`新規メッセージ [${paddedNo}] を登録しました。`);
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
    setData((prev) => prev.filter((x) => x.msgNo !== currentRecord.msgNo));
    message.success(`メッセージ [${currentRecord.msgNo}] を削除しました。`);
    handleClearForm();
  };

  // Export CSV (F6)
  const handleExportCsv = () => {
    if (!data || data.length === 0) {
      message.warning('出力対象のデータがありません。');
      return;
    }
    exportToCsv(
      `メッセージマスタ_AD1750C_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { header: 'メッセージCD', key: 'msgNo' },
        { header: 'メッセージ1', key: 'msg1' },
        { header: 'メッセージ2', key: 'msg2' },
        { header: '基本使用サブシステム', key: 'subSysCd' },
        { header: 'ボタン区分', key: 'botanKbn' },
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
        form.setFieldsValue({ msgNo: undefined });
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
  const filteredData = data.filter((item) => {
    const num = parseInt(item.msgNo, 10);
    let matchesCategory = true;
    if (selectedCategory === 'INFO') matchesCategory = num < 1000;
    else if (selectedCategory === 'CONFIRM') matchesCategory = num >= 1000 && num < 2000;
    else if (selectedCategory === 'WARN') matchesCategory = num >= 2000 && num < 3000;
    else if (selectedCategory === 'ERROR') matchesCategory = num >= 3000;

    const matchesSearch =
      !searchText ||
      item.msg1.includes(searchText) ||
      (item.msg2 && item.msg2.includes(searchText)) ||
      item.msgNo.includes(searchText);

    return matchesCategory && matchesSearch;
  });

  // Columns for Tab 2 (一覧照会)
  const columns: ColumnsType<MessageMasterItem> = [
    {
      title: '分類',
      key: 'category',
      width: 140,
      render: (_: any, r: MessageMasterItem) => getMsgCategoryTag(r.msgNo),
    },
    {
      title: 'メッセージCD',
      dataIndex: 'msgNo',
      key: 'msgNo',
      width: 110,
      render: (val: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>
          {val}
        </span>
      ),
    },
    {
      title: 'メッセージ1 (本文)',
      dataIndex: 'msg1',
      key: 'msg1',
      render: (text: string, record: MessageMasterItem) => (
        <a
          onClick={() => handleLoadRecord(record, 'edit')}
          style={{ fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}
        >
          {text}
        </a>
      ),
    },
    {
      title: 'メッセージ2 (補足・ガイダンス)',
      dataIndex: 'msg2',
      key: 'msg2',
      render: (val?: string) => <span style={{ fontSize: 12, color: '#64748b' }}>{val || '-'}</span>,
    },
    {
      title: 'サブシステム',
      dataIndex: 'subSysCd',
      key: 'subSysCd',
      width: 110,
      render: (val: string) => <Tag color="geekblue">{val}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_: any, record: MessageMasterItem) => (
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
                      setData(SEED_MESSAGES);
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
                      修正: #{currentRecord?.msgNo}
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
                   TAB 1: COMPLETE FULL-PAGE FORM (AD1750C SPECIFICATION)
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
                          メッセージCD:
                        </Text>
                        <Form.Item name="msgNo" noStyle rules={[{ required: true, message: 'CD必須' }]}>
                          <Input
                            placeholder="例: 01001"
                            maxLength={5}
                            disabled={mode !== 'new'}
                            onBlur={(e) => handleCheckCode(e.target.value)}
                            style={{ width: 110, fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}
                          />
                        </Form.Item>
                      </div>

                      <div>
                        {mode === 'edit' && currentRecord && (
                          <Tag color="processing" style={{ fontSize: 12, padding: '2px 8px' }}>
                            【修正モード: No.{currentRecord.msgNo}】
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

                  {/* 1. メッセージ定義情報 */}
                  <Card
                    type="inner"
                    title={<span style={{ fontWeight: 700, color: '#1e293b' }}>1. メッセージ文言定義</span>}
                    style={{ marginBottom: 16, borderRadius: 8 }}
                  >
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="msg1"
                          label="メッセージ1 (本文・ダイアログ主文 - 全角50文字以内)"
                          rules={[{ required: true, message: 'メッセージ本文を入力してください' }]}
                        >
                          <Input placeholder="例: 登録しますか？" maxLength={50} />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="msg2"
                          label="メッセージ2 (補足・ガイダンス文 - 全角50文字以内)"
                        >
                          <Input placeholder="例: 入力内容をデータベースに保存します。" maxLength={50} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>

                  {/* 2. 制御パラメータ */}
                  <Card
                    type="inner"
                    title={<span style={{ fontWeight: 700, color: '#1e293b' }}>2. 関連サブシステムおよびボタン構成</span>}
                    style={{ marginBottom: 20, borderRadius: 8 }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="subSysCd" label="基本使用サブシステムCD">
                          <Select
                            options={[
                              { value: '共通', label: '共通 (全システム)' },
                              { value: 'AD', label: 'AD (管理・マスタ)' },
                              { value: 'GK', label: 'GK (原価管理)' },
                              { value: 'UR', label: 'UR (売上管理)' },
                              { value: 'SR', label: 'SR (仕入管理)' },
                              { value: 'VM', label: 'VM (月次更新)' },
                              { value: 'MS', label: 'MS (マスタ保守)' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="botanKbn" label="ボタン構成区分 (ダイアログ操作)">
                          <Select
                            options={[
                              { value: 1, label: '1: [はい / OK] のみ' },
                              { value: 2, label: '2: [はい / いいえ] (二者択一)' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>

                  {/* Audit Information Bar per AD1750C Specification */}
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
                          description={`メッセージ「No.${currentRecord.msgNo}」を削除しますか？`}
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
                  <span className="erp-tab-count-pill">{filteredData.length} 件</span>
                </span>
              ),
              children: (
                /* ========================================================
                   TAB 2: DATABASE DATA TABLE & SEARCH (AD1750C LIST)
                   ======================================================== */
                <div style={{ marginTop: 8 }}>
                  <Row justify="space-between" align="middle" style={{ marginBottom: 16 }} gutter={[12, 12]}>
                    <Col xs={24} sm={16} md={14}>
                      <Space size={10} style={{ width: '100%' }} wrap>
                        <Select
                          value={selectedCategory}
                          onChange={(val) => setSelectedCategory(val)}
                          style={{ width: 170 }}
                          options={[
                            { value: 'ALL', label: 'すべてのメッセージ' },
                            { value: 'INFO', label: '正常終了 (00000)' },
                            { value: 'CONFIRM', label: '確認 (01000)' },
                            { value: 'WARN', label: '警告 (02000)' },
                            { value: 'ERROR', label: 'エラー (03000)' },
                          ]}
                        />
                        <Input
                          placeholder="メッセージ本文 / CD... (リアルタイム検索)"
                          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          allowClear
                          style={{ width: 280 }}
                        />
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
                          登録件数: <strong style={{ color: '#0f172a' }}>{filteredData.length}</strong> 件
                        </Text>
                      </Space>
                    </Col>
                  </Row>

                  <Table
                    rowKey="msgNo"
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
          MODAL: PRINT SPECIFICATION (AD1750C 印刷指定 - F8)
          ======================================================== */}
      <Modal
        title={
          <Space>
            <PrinterOutlined style={{ color: '#0ea5e9' }} />
            <span style={{ fontWeight: 700 }}>■ 印刷指定 (AD1750C メッセージマスタ一覧表)</span>
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
            style={{ background: '#0ea5e9', borderColor: '#0ea5e9' }}
          >
            印刷プレビュー (F8)
          </Button>,
        ]}
      >
        <div style={{ padding: '12px 0' }}>
          <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
            登録されている全メッセージマスタ（案内・確認・警告・エラー）一覧を印刷プレビューで表示します。
          </p>
        </div>
      </Modal>
    </div>
  );
};
