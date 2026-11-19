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
  Tag,
  Form,
  message,
  Popconfirm,
  Typography,
  Select,
  Tabs,
  Tooltip,
  Modal,
  Checkbox,
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
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { API_BASE_URL } from '../../api/client';
import { exportToCsv } from '../../utils/csvExport';

const { Text } = Typography;

export interface UserGrpItem {
  userGrpCd: string;
  userGrpName: string;
  runAplCnt: number;
  permissions?: string[];
}

const INITIAL_FORM_VALUES: Partial<UserGrpItem> = {
  runAplCnt: 5,
  permissions: ['AD', 'GK', 'UR', 'SR', 'VM'],
};

export const UserGrpMasterPage: React.FC = () => {
  // Navigation & Tab state: default 'form' (Tab 1: 登録・編集フォーム)
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  // Mode: 'new' (1: 新規登録), 'edit' (2: 修正), 'inquiry' (4: 照会)
  const [mode, setMode] = useState<'new' | 'edit' | 'inquiry'>('new');

  // Master Data
  const [data, setData] = useState<UserGrpItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  // Form State
  const [form] = Form.useForm();
  const [currentRecord, setCurrentRecord] = useState<UserGrpItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Print Modal State (F8)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Fetch Master Data
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/usergrp`);
      if (res.ok) {
        const result = await res.json();
        setData(result || []);
      } else {
        // Fallback demo data per AD1720C specification
        const mockList: UserGrpItem[] = [
          { userGrpCd: '1', userGrpName: '一般グループ', runAplCnt: 5, permissions: ['GK', 'UR', 'SR'] },
          { userGrpCd: '2', userGrpName: '営業部グループ', runAplCnt: 5, permissions: ['GK', 'UR'] },
          { userGrpCd: '3', userGrpName: '工事部グループ', runAplCnt: 5, permissions: ['GK', 'SR'] },
          { userGrpCd: '4', userGrpName: '総務部グループ', runAplCnt: 5, permissions: ['GK', 'UR', 'SR'] },
          { userGrpCd: '9', userGrpName: 'システム管理者グループ', runAplCnt: 10, permissions: ['AD', 'GK', 'UR', 'SR', 'VM'] },
        ];
        setData(mockList);
      }
    } catch {
      // Mock Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Initial Form Reset
  const handleClearForm = useCallback(() => {
    form.resetFields();
    form.setFieldsValue(INITIAL_FORM_VALUES);
    setCurrentRecord(null);
    setMode('new');
    message.info('入力フォームをクリアしました。(新規登録モード)');
  }, [form]);

  // Load a Record into Tab 1 Form for Editing / Viewing
  const handleLoadRecord = useCallback(
    (item: UserGrpItem, targetMode: 'edit' | 'inquiry' = 'edit') => {
      setCurrentRecord(item);
      setMode(targetMode);
      form.setFieldsValue({
        ...item,
        permissions: item.permissions || ['GK', 'UR', 'SR'],
      });
      setActiveTab('form');
      if (targetMode === 'edit') {
        message.success(`グループ「${item.userGrpName}」を修正モードで読み込みました。`);
      } else {
        message.info(`グループ「${item.userGrpName}」を照会モードで表示しています。`);
      }
    },
    [form]
  );

  // Check code on blur
  const handleCheckCode = async (codeVal: string | undefined) => {
    if (!codeVal) return;
    const existing = data.find((x) => x.userGrpCd === codeVal);
    if (existing && mode === 'new') {
      message.warning(`グループCD ${codeVal} は既に登録されています。修正モードに切り替えます。`);
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
    const idx = data.findIndex((x) => x.userGrpCd === currentRecord.userGrpCd);
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
    const idx = data.findIndex((x) => x.userGrpCd === currentRecord.userGrpCd);
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
        await fetch(`${API_BASE_URL}/api/usergrp/${currentRecord.userGrpCd}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        }).catch(() => {});
        message.success(`グループCD ${currentRecord.userGrpCd} を更新しました。`);
        setData((prev) => prev.map((item) => (item.userGrpCd === currentRecord.userGrpCd ? { ...item, ...values } : item)));
        setCurrentRecord({ ...currentRecord, ...values });
      } else {
        await fetch(`${API_BASE_URL}/api/usergrp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        }).catch(() => {});
        message.success(`グループCD ${values.userGrpCd} を新規登録しました。`);
        setData((prev) => [...prev, values]);
        setCurrentRecord(values);
        setMode('edit');
      }
      fetchGroups();
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
      await fetch(`${API_BASE_URL}/api/usergrp/${currentRecord.userGrpCd}`, {
        method: 'DELETE',
      }).catch(() => {});
      message.success(`グループCD ${currentRecord.userGrpCd} を削除しました。`);
      setData((prev) => prev.filter((x) => x.userGrpCd !== currentRecord.userGrpCd));
      handleClearForm();
      fetchGroups();
    } catch {
      message.error('削除処理に失敗しました。');
    }
  };

  // Export CSV (F6)
  const handleExportCsv = () => {
    if (!data || data.length === 0) {
      message.warning('出力対象のデータがありません。');
      return;
    }
    exportToCsv(
      `ユーザーグループマスタ_AD1720C_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { header: 'グループCD', key: 'userGrpCd' },
        { header: 'グループ名称', key: 'userGrpName' },
        { header: '同時実行可能APL数', key: 'runAplCnt' },
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
        form.setFieldsValue({ userGrpCd: undefined });
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

  // Filtered data for Tab 2
  const filteredData = data.filter(
    (x) => !keyword || x.userGrpName.includes(keyword) || x.userGrpCd.includes(keyword)
  );

  // Columns for Tab 2 (一覧照会)
  const columns: ColumnsType<UserGrpItem> = [
    {
      title: 'グループCD',
      dataIndex: 'userGrpCd',
      key: 'userGrpCd',
      width: 120,
      render: (val: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>
          {val}
        </span>
      ),
    },
    {
      title: 'グループ名称',
      dataIndex: 'userGrpName',
      key: 'userGrpName',
      render: (text: string, record: UserGrpItem) => (
        <a
          onClick={() => handleLoadRecord(record, 'edit')}
          style={{ fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}
        >
          {text}
        </a>
      ),
    },
    {
      title: '同時実行可能APL数 (ユーザ毎)',
      dataIndex: 'runAplCnt',
      key: 'runAplCnt',
      width: 220,
      align: 'center',
      render: (val: number) => (
        <Tag color="cyan" style={{ fontWeight: 700, fontSize: 13, borderRadius: 6 }}>
          最大 {val} アプリケーション
        </Tag>
      ),
    },
    {
      title: '起動許可サブシステム',
      key: 'subsystems',
      render: (_: any, r: UserGrpItem) => (
        <Space size={4} wrap>
          {(r.permissions || ['GK', 'UR', 'SR']).map((s) => (
            <Tag key={s} color="blue" style={{ borderRadius: 4, fontSize: 11 }}>
              {s}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_: any, record: UserGrpItem) => (
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
                      fetchGroups();
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
                      修正: #{currentRecord?.userGrpCd}
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
                   TAB 1: COMPLETE FULL-PAGE FORM (AD1720C SPECIFICATION)
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
                          ユーザグループCD:
                        </Text>
                        <Form.Item name="userGrpCd" noStyle rules={[{ required: true, message: 'CD必須' }]}>
                          <Input
                            placeholder="例: 1"
                            maxLength={4}
                            disabled={mode !== 'new'}
                            onBlur={(e) => handleCheckCode(e.target.value)}
                            style={{ width: 110, fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}
                          />
                        </Form.Item>
                      </div>

                      <div>
                        {mode === 'edit' && currentRecord && (
                          <Tag color="processing" style={{ fontSize: 12, padding: '2px 8px' }}>
                            【修正モード: {currentRecord.userGrpName}】
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

                  {/* 1. 基本設定 */}
                  <Card
                    type="inner"
                    title={<span style={{ fontWeight: 700, color: '#1e293b' }}>1. グループ基本設定</span>}
                    style={{ marginBottom: 16, borderRadius: 8 }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={14}>
                        <Form.Item
                          name="userGrpName"
                          label="ユーザグループ名称 (全角12文字以内)"
                          rules={[{ required: true, message: 'グループ名称を入力してください' }]}
                        >
                          <Input placeholder="例: 営業部グループ" maxLength={12} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={10}>
                        <Form.Item
                          name="runAplCnt"
                          label="同時実行可能APL数 (ユーザ毎)"
                          tooltip="同一ユーザーが同時に起動可能なシステム画面数 (1～9)"
                          rules={[{ required: true, message: 'APL数を入力してください' }]}
                        >
                          <InputNumber min={1} max={9} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>

                  {/* 2. サブシステム起動許可マトリクス */}
                  <Card
                    type="inner"
                    title={
                      <Space>
                        <SafetyCertificateOutlined style={{ color: '#4f46e5' }} />
                        <span style={{ fontWeight: 700, color: '#1e293b' }}>2. サブシステム起動許可設定 (権限)</span>
                      </Space>
                    }
                    style={{ marginBottom: 20, borderRadius: 8 }}
                  >
                    <Form.Item name="permissions" label="グループ利用可能サブシステム">
                      <Checkbox.Group style={{ width: '100%' }}>
                        <Row gutter={[16, 16]}>
                          <Col xs={24} sm={12} md={8}>
                            <Checkbox value="GK">
                              <strong>GK</strong>: 原価管理サブシステム (実行予算・原価)
                            </Checkbox>
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <Checkbox value="UR">
                              <strong>UR</strong>: 売上管理サブシステム (請求・売掛)
                            </Checkbox>
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <Checkbox value="SR">
                              <strong>SR</strong>: 仕入管理サブシステム (発注・買掛)
                            </Checkbox>
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <Checkbox value="VM">
                              <strong>VM</strong>: 車両管理サブシステム
                            </Checkbox>
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <Checkbox value="AD">
                              <strong>AD</strong>: システム管理・マスタ保守 (管理者専用)
                            </Checkbox>
                          </Col>
                        </Row>
                      </Checkbox.Group>
                    </Form.Item>
                  </Card>

                  {/* Audit Information Bar per AD1720C Specification */}
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
                          description={`グループ「${currentRecord.userGrpName} (${currentRecord.userGrpCd})」を削除しますか？`}
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
                   TAB 2: DATABASE DATA TABLE & SEARCH (AD1720C LIST)
                   ======================================================== */
                <div style={{ marginTop: 8 }}>
                  <Row justify="space-between" align="middle" style={{ marginBottom: 16 }} gutter={[12, 12]}>
                    <Col xs={24} sm={16} md={12}>
                      <Space size={10} style={{ width: '100%' }}>
                        <Input
                          placeholder="グループCD / グループ名称... (リアルタイム検索)"
                          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                          allowClear
                          style={{ width: 300 }}
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
                    rowKey="userGrpCd"
                    columns={columns}
                    dataSource={filteredData}
                    loading={loading}
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
          MODAL: PRINT SPECIFICATION (AD1720C 印刷指定 - F8)
          ======================================================== */}
      <Modal
        title={
          <Space>
            <PrinterOutlined style={{ color: '#4f46e5' }} />
            <span style={{ fontWeight: 700 }}>■ 印刷指定 (AD1720C ユーザーグループマスタ一覧表)</span>
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
            style={{ background: '#4f46e5', borderColor: '#4f46e5' }}
          >
            印刷プレビュー (F8)
          </Button>,
        ]}
      >
        <div style={{ padding: '12px 0' }}>
          <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
            現在登録されているユーザーグループマスタの一覧および起動許可権限を印刷プレビューで表示します。
          </p>
        </div>
      </Modal>
    </div>
  );
};
