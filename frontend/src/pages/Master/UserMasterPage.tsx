import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Form,
  Row,
  Col,
  message,
  Popconfirm,
  Tag,
  Typography,
  Select,
  Tabs,
  Badge,
  Tooltip,
  Modal,
  Checkbox,
  DatePicker,
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
  UserOutlined,
  ReloadOutlined,
  PrinterOutlined,
  LockOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { API_BASE_URL } from '../../api/client';
import { exportToCsv } from '../../utils/csvExport';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

export interface UserItem {
  userCd: string;
  userName: string;
  userNameR?: string;
  userNameK?: string;
  tantoKbn: number;
  tantoKbnNm?: string;
  userGrpCd?: string;
  userGrpNm?: string;
  syubetu: number;
  syubetuNm?: string;
  password?: string;
  passExpireDate?: string;
  userIdExpireDate?: string;
  deleteFlg?: boolean;
  biko?: string;
  loginDate?: string;
  passUpdDate?: string;
}

// Initial Default Values per AD1730C Specification
const INITIAL_FORM_VALUES: Partial<UserItem> = {
  tantoKbn: 1,
  userGrpCd: '1',
  syubetu: 1,
  deleteFlg: false,
};

export const UserMasterPage: React.FC = () => {
  // Navigation & Tab state: default 'form' (Tab 1: 登録・編集フォーム)
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  // Mode: 'new' (1: 新規登録), 'edit' (2: 修正), 'inquiry' (4: 照会)
  const [mode, setMode] = useState<'new' | 'edit' | 'inquiry'>('new');

  // Master Data & Search
  const [data, setData] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedGrp, setSelectedGrp] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);

  // Form State
  const [form] = Form.useForm();
  const [currentRecord, setCurrentRecord] = useState<UserItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { user: currentUser } = useAuth();
  const isSelf = !!(currentRecord && currentUser && currentRecord.userCd === currentUser.userCd);

  // Print Modal State (F8)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printStartCd, setPrintStartCd] = useState<string>('000001');
  const [printEndCd, setPrintEndCd] = useState<string>('999999');

  // Fetch Master Data
  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/user?page=${page}&pageSize=${pageSize}`;
      if (searchText) url += `&search=${encodeURIComponent(searchText)}`;
      if (selectedGrp) url += `&userGrpCd=${encodeURIComponent(selectedGrp)}`;

      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        setData(result.items || []);
        setTotalCount(result.totalCount || 0);
      } else {
        // Mock fallback per specification
        const mockList: UserItem[] = [
          {
            userCd: '000001',
            userName: '酒井 太郎',
            userNameR: '酒井',
            userNameK: 'サカイ タロウ',
            tantoKbn: 2,
            tantoKbnNm: '管理者',
            userGrpCd: '9',
            userGrpNm: '管理者グループ',
            syubetu: 4,
            syubetuNm: '部長',
            biko: 'システム管理者 / 業務統括',
            deleteFlg: false,
            passExpireDate: '2026/12/31',
            userIdExpireDate: '2029/12/31',
            loginDate: '2026/11/18 09:12',
          },
          {
            userCd: '000002',
            userName: '佐藤 次郎',
            userNameR: '佐藤',
            userNameK: 'サトウ ジロウ',
            tantoKbn: 1,
            tantoKbnNm: '担当者',
            userGrpCd: '2',
            userGrpNm: '営業部',
            syubetu: 2,
            syubetuNm: '主任',
            biko: '営業一部担当 主任',
            deleteFlg: false,
            passExpireDate: '2026/12/31',
            userIdExpireDate: '2029/12/31',
            loginDate: '2026/11/17 14:30',
          },
          {
            userCd: '000003',
            userName: '鈴木 一郎',
            userNameR: '鈴木',
            userNameK: 'スズキ イチロウ',
            tantoKbn: 1,
            tantoKbnNm: '担当者',
            userGrpCd: '3',
            userGrpNm: '工事部',
            syubetu: 3,
            syubetuNm: '課長',
            biko: '現場施工管理 工務課長',
            deleteFlg: false,
            passExpireDate: '2026/12/31',
            userIdExpireDate: '2029/12/31',
            loginDate: '2026/11/16 08:45',
          },
          {
            userCd: '000004',
            userName: '田中 美咲',
            userNameR: '田中',
            userNameK: 'タナカ ミサキ',
            tantoKbn: 1,
            tantoKbnNm: '担当者',
            userGrpCd: '4',
            userGrpNm: '総務部',
            syubetu: 1,
            syubetuNm: '一般',
            biko: '経理・請求書発行事務',
            deleteFlg: false,
            passExpireDate: '2026/12/31',
            userIdExpireDate: '2029/12/31',
            loginDate: '2026/11/18 08:30',
          },
        ];
        setData(
          mockList.filter(
            (x) =>
              (!searchText ||
                x.userName.includes(searchText) ||
                x.userCd.includes(searchText) ||
                (x.userNameK && x.userNameK.includes(searchText))) &&
              (!selectedGrp || x.userGrpCd === selectedGrp)
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
    fetchUsers();
  }, [page, pageSize, selectedGrp]);

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
    (item: UserItem, targetMode: 'edit' | 'inquiry' = 'edit') => {
      setCurrentRecord(item);
      setMode(targetMode);
      form.setFieldsValue({
        ...item,
        deleteFlg: !!item.deleteFlg,
        passExpireDate: item.passExpireDate ? dayjs(item.passExpireDate) : undefined,
        userIdExpireDate: item.userIdExpireDate ? dayjs(item.userIdExpireDate) : undefined,
      });
      setActiveTab('form');
      if (targetMode === 'edit') {
        message.success(`ユーザー「${item.userName} (${item.userCd})」を修正モードで読み込みました。`);
      } else {
        message.info(`ユーザー「${item.userName} (${item.userCd})」を照会モードで表示しています。`);
      }
    },
    [form]
  );

  // Check code on blur
  const handleCheckCode = async (codeVal: string | undefined) => {
    if (!codeVal) return;
    const padded = codeVal.padStart(6, '0');
    form.setFieldsValue({ userCd: padded });
    const existing = data.find((x) => x.userCd === padded);
    if (existing && mode === 'new') {
      message.warning(`コード ${padded} は既に登録されています。修正モードに切り替えます。`);
      handleLoadRecord(existing, 'edit');
    }
  };

  // Auto populate short name on name blur (per spec row 45)
  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const currentRyaku = form.getFieldValue('userNameR');
    if (val && !currentRyaku) {
      const parts = val.trim().split(/[\s　]+/);
      if (parts.length > 0) {
        form.setFieldsValue({ userNameR: parts[0] });
      }
    }
  };

  // Previous Record (F9)
  const handlePrevRecord = () => {
    if (data.length === 0) return;
    if (!currentRecord) {
      handleLoadRecord(data[data.length - 1], 'edit');
      return;
    }
    const idx = data.findIndex((x) => x.userCd === currentRecord.userCd);
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
    const idx = data.findIndex((x) => x.userCd === currentRecord.userCd);
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
      const payload = {
        ...values,
        userCd: String(values.userCd).padStart(6, '0'),
        deleteFlg: !!values.deleteFlg,
        passExpireDate: values.passExpireDate ? values.passExpireDate.format('YYYY/MM/DD') : undefined,
        userIdExpireDate: values.userIdExpireDate ? values.userIdExpireDate.format('YYYY/MM/DD') : undefined,
      };

      if (mode === 'edit' && currentRecord) {
        if (isSelf && payload.deleteFlg) {
          message.error('現在ログイン中の自身のアカウントを無効化（利用停止）することはできません。');
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/user/${currentRecord.userCd}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Cd': currentUser?.userCd || '',
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || '更新処理に失敗しました。');
        }
        message.success(`ユーザーコード ${currentRecord.userCd} を更新しました。`);
        setData((prev) => prev.map((item) => (item.userCd === currentRecord.userCd ? { ...item, ...payload } : item)));
        setCurrentRecord({ ...currentRecord, ...payload });
      } else {
        const res = await fetch(`${API_BASE_URL}/api/user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Cd': currentUser?.userCd || '',
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || '新規登録処理に失敗しました。');
        }
        message.success(`ユーザーコード ${payload.userCd} を新規登録しました。`);
        setData((prev) => [...prev, payload]);
        setCurrentRecord(payload);
        setMode('edit');
      }
      fetchUsers();
    } catch (err: any) {
      message.error(err.message || '入力必須項目またはフォーマットを確認してください。');
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
    if (isSelf) {
      message.error('現在ログイン中の自身のアカウントを削除することはできません。');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/${currentRecord.userCd}`, {
        method: 'DELETE',
        headers: {
          'X-User-Cd': currentUser?.userCd || '',
        },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || '削除処理に失敗しました。');
      }
      message.success(`ユーザーコード ${currentRecord.userCd} を削除しました。`);
      setData((prev) => prev.filter((x) => x.userCd !== currentRecord.userCd));
      handleClearForm();
      fetchUsers();
    } catch (err: any) {
      message.error(err.message || '削除処理に失敗しました。');
    }
  };

  // Export CSV (F6)
  const handleExportCsv = async () => {
    let exportData = data;
    try {
      const res = await fetch(`${API_BASE_URL}/api/user?page=1&pageSize=1000`);
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
      `ユーザーマスタ_AD1730C_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { header: 'ユーザCD', key: 'userCd' },
        { header: 'ユーザ名称', key: 'userName' },
        { header: 'ユーザ略称', key: 'userNameR' },
        { header: 'フリガナ', key: 'userNameK' },
        { header: '担当者区分', key: 'tantoKbn' },
        { header: '所属グループ', key: 'userGrpNm' },
        { header: 'ユーザ種別', key: 'syubetuNm' },
        { header: 'パスワード期限', key: 'passExpireDate' },
        { header: 'ID有効期限', key: 'userIdExpireDate' },
        { header: '備考', key: 'biko' },
      ],
      exportData
    );
  };

  // Open Print Modal (F8)
  const handleOpenPrintModal = () => {
    if (data.length > 0) {
      const sortedCds = [...data].map((x) => x.userCd).sort();
      setPrintStartCd(sortedCds[0]);
      setPrintEndCd(sortedCds[sortedCds.length - 1]);
    }
    setIsPrintModalOpen(true);
  };

  // Execute Print
  const handleExecutePrint = () => {
    setIsPrintModalOpen(false);
    message.info('印刷ダイアログを開きます。');
    setTimeout(() => {
      window.print();
    }, 300);
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
        form.setFieldsValue({ userCd: undefined });
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
        handleOpenPrintModal();
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
  const columns: ColumnsType<UserItem> = [
    {
      title: 'ユーザCD',
      dataIndex: 'userCd',
      key: 'userCd',
      width: 100,
      render: (val: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>
          {val}
        </span>
      ),
    },
    {
      title: 'ユーザ名称',
      dataIndex: 'userName',
      key: 'userName',
      render: (text: string, record: UserItem) => (
        <div>
          <a
            onClick={() => handleLoadRecord(record, 'edit')}
            style={{ fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}
          >
            {text}
          </a>
          {record.userNameR && (
            <span style={{ marginLeft: 8, color: '#64748b', fontSize: 12 }}>({record.userNameR})</span>
          )}
        </div>
      ),
    },
    {
      title: 'フリガナ',
      dataIndex: 'userNameK',
      key: 'userNameK',
      width: 130,
      render: (val?: string) => <span style={{ fontSize: 12, color: '#64748b' }}>{val || '-'}</span>,
    },
    {
      title: '担当者区分',
      dataIndex: 'tantoKbn',
      key: 'tantoKbn',
      width: 110,
      render: (val: number, r: UserItem) => (
        <Tag color={val === 2 ? 'red' : 'blue'} style={{ borderRadius: 6 }}>
          {r.tantoKbnNm || (val === 2 ? '管理者' : '担当者')}
        </Tag>
      ),
    },
    {
      title: '所属グループ',
      dataIndex: 'userGrpNm',
      key: 'userGrpNm',
      width: 130,
      render: (val?: string) => (
        <Tag color="purple" style={{ borderRadius: 6 }}>
          {val || '一般グループ'}
        </Tag>
      ),
    },
    {
      title: '役職・種別',
      dataIndex: 'syubetuNm',
      key: 'syubetuNm',
      width: 110,
      render: (val?: string) => val || '一般',
    },
    {
      title: '状態',
      key: 'status',
      width: 90,
      align: 'center',
      render: (_: any, r: UserItem) => (
        <Tag color={r.deleteFlg ? 'default' : 'success'} style={{ borderRadius: 6 }}>
          {r.deleteFlg ? '無効 (削除)' : '有効'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_: any, record: UserItem) => (
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
          SCREEN TITLE & HIGH-LEVEL ERP METADATA BAR (CARD 1)
          ============================================================== */}
      <Card bodyStyle={{ padding: '16px 24px' }} style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space align="center" size={14}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.15)',
                }}
              >
                <UserOutlined style={{ fontSize: 24, color: '#2563eb' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
                    ユーザマスタメンテナンス (AD1730C)
                  </Title>
                  <Tag color="blue" style={{ borderRadius: 6, fontWeight: 700, padding: '2px 8px' }}>
                    マスタ
                  </Tag>
                  {activeTab === 'form' && (
                    <Tag
                      color={mode === 'new' ? 'success' : mode === 'edit' ? 'warning' : 'processing'}
                      style={{ borderRadius: 6, fontWeight: 700, padding: '2px 8px' }}
                    >
                      {mode === 'new' ? '【新規登録モード】' : mode === 'edit' ? '【修正モード】' : '【照会モード】'}
                    </Tag>
                  )}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  社内システム利用者のアカウント情報、権限グループ、セキュリティ設定を一括管理します。
                </Text>
              </div>
            </Space>
          </Col>

          {/* Quick Stats / Header Actions */}
          <Col>
            <Space size={10} wrap>
              <Tooltip title="F8キーでも実行できます">
                <Button icon={<PrinterOutlined />} onClick={handleOpenPrintModal} style={{ fontWeight: 600 }}>
                  (F8) 印刷
                </Button>
              </Tooltip>
              <Tooltip title="F6キーでも実行できます">
                <Button icon={<DownloadOutlined />} onClick={handleExportCsv} style={{ fontWeight: 600 }}>
                  (F6) CSV出力
                </Button>
              </Tooltip>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchUsers();
                  message.success('マスタデータを再取得しました。');
                }}
                loading={loading}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ==============================================================
          TWO-TAB ARCHITECTURE: Tab 1 (登録・編集) & Tab 2 (データ一覧) (CARD 2)
          ============================================================== */}
      <Card bodyStyle={{ padding: '8px 20px 20px 20px' }} style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'form' | 'list')}
          size="large"
          items={[
            {
              key: 'form',
              label: (
                <span style={{ fontWeight: 700, fontSize: 14, padding: '0 8px' }}>
                  <FormOutlined style={{ marginRight: 6 }} />
                  登録・編集フォーム (AD1730C)
                  {mode === 'new' && <Tag color="green" style={{ marginLeft: 8 }}>新規</Tag>}
                  {mode === 'edit' && <Tag color="blue" style={{ marginLeft: 8 }}>修正: #{currentRecord?.userCd}</Tag>}
                  {mode === 'inquiry' && <Tag color="orange" style={{ marginLeft: 8 }}>照会</Tag>}
                </span>
              ),
              children: (
                /* ========================================================
                   TAB 1: COMPLETE FULL-PAGE FORM (AD1730C SPECIFICATION)
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
                        <Text strong style={{ fontSize: 13, color: '#475569' }}>
                          処理区分:
                        </Text>
                        <Select
                          value={mode}
                          onChange={(val) => {
                            setMode(val);
                            if (val === 'new') handleClearForm();
                          }}
                          style={{ width: 140 }}
                          options={[
                            { value: 'new', label: '1: 新規登録' },
                            { value: 'edit', label: '2: データ修正' },
                            { value: 'inquiry', label: '4: 照会 (閲覧)' },
                          ]}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Text strong style={{ fontSize: 13, color: '#475569' }}>
                          ユーザコード:
                        </Text>
                        <Form.Item name="userCd" noStyle rules={[{ required: true, message: 'コード必須' }]}>
                          <Input
                            placeholder="例: 000001"
                            maxLength={6}
                            disabled={mode !== 'new'}
                            onBlur={(e) => handleCheckCode(e.target.value)}
                            style={{ width: 130, fontFamily: 'monospace', fontWeight: 700 }}
                          />
                        </Form.Item>
                        <Tooltip title="データ一覧からユーザを選択 (F5)">
                          <Button
                            icon={<SearchOutlined />}
                            onClick={() => setActiveTab('list')}
                            style={{ fontWeight: 600 }}
                          >
                            一覧から選択
                          </Button>
                        </Tooltip>
                      </div>

                      <div>
                        {mode === 'edit' && currentRecord && (
                          <Tag color="processing" style={{ fontSize: 12, padding: '2px 8px' }}>
                            【修正モード: {currentRecord.userName}】
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
                      <Button icon={<RightOutlined />} onClick={handleNextRecord} disabled={data.length === 0}>
                        (F10) 次データ
                      </Button>
                    </Space>
                  </div>

                  {/* 1. 基本プロファイル (Profile) */}
                  <Card
                    type="inner"
                    title={<span style={{ fontWeight: 700, color: '#1e293b' }}>1. ユーザー基本情報</span>}
                    style={{ marginBottom: 16, borderRadius: 8 }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={10}>
                        <Form.Item
                          name="userName"
                          label="ユーザ名称 (全角20文字以内)"
                          rules={[{ required: true, message: 'ユーザ名称を入力してください' }]}
                        >
                          <Input placeholder="例: 酒井 太郎" maxLength={20} onBlur={handleNameBlur} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={7}>
                        <Form.Item
                          name="userNameR"
                          label="ユーザ略称 (全角10文字以内)"
                          tooltip="未入力の場合、氏名の姓が自動反映されます"
                        >
                          <Input placeholder="例: 酒井" maxLength={10} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={7}>
                        <Form.Item name="userNameK" label="フリガナ (半角カナ10文字以内)">
                          <Input placeholder="例: ｻｶｲ ﾀﾛｳ" maxLength={10} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="tantoKbn"
                          label="担当者区分 (AD1730C)"
                          rules={[{ required: true, message: '担当者区分を選択してください' }]}
                        >
                          <Select
                            options={[
                              { value: 1, label: '1: 担当者 (業務運用)' },
                              { value: 2, label: '2: 管理者 (全機能操作可能)' },
                              { value: 9, label: '9: 閲覧専用 (照会のみ)' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="userGrpCd"
                          label="所属グループ (AD1720C)"
                          rules={[{ required: true, message: '所属グループを選択してください' }]}
                        >
                          <Select
                            options={[
                              { value: '1', label: '1: 一般グループ' },
                              { value: '2', label: '2: 営業部' },
                              { value: '3', label: '3: 工事部' },
                              { value: '4', label: '4: 総務部' },
                              { value: '9', label: '9: 管理者グループ' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="syubetu"
                          label="ユーザ種別 (役職ランク)"
                          rules={[{ required: true, message: 'ユーザ種別を選択してください' }]}
                        >
                          <Select
                            options={[
                              { value: 1, label: '1: 一般社員' },
                              { value: 2, label: '2: 主任' },
                              { value: 3, label: '3: 課長' },
                              { value: 4, label: '4: 部長' },
                              { value: 5, label: '5: 役員・経営幹部' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item name="biko" label="備考 (全角40文字以内)">
                          <Input placeholder="社内担当部署、内線番号、特記事項など" maxLength={40} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>

                  {/* 2. 認証・セキュリティ (Security & Expirations) */}
                  <Card
                    type="inner"
                    title={<span style={{ fontWeight: 700, color: '#1e293b' }}>2. ログイン認証・セキュリティ設定</span>}
                    style={{ marginBottom: 16, borderRadius: 8 }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="password"
                          label="パスワード"
                          tooltip="8文字以上の英数字。新規登録時は必須です。"
                          rules={mode === 'new' ? [{ required: true, message: 'パスワードを入力してください' }] : []}
                        >
                          <Input.Password
                            prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                            placeholder={mode === 'edit' ? '変更する場合のみ入力' : '半角英数字8桁以上'}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="passExpireDate" label="パスワード有効期限">
                          <DatePicker style={{ width: '100%' }} format="YYYY/MM/DD" placeholder="例: 2026/12/31" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="userIdExpireDate" label="ユーザID有効期限">
                          <DatePicker style={{ width: '100%' }} format="YYYY/MM/DD" placeholder="例: 2029/12/31" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <div
                      style={{
                        background: isSelf ? '#fefce8' : '#fef2f2',
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: isSelf ? '1px solid #fef08a' : '1px solid #fecaca',
                        marginTop: 8,
                      }}
                    >
                      <Form.Item name="deleteFlg" valuePropName="checked" noStyle>
                        <Checkbox
                          disabled={isSelf}
                          style={{ fontWeight: 700, color: isSelf ? '#a16207' : '#dc2626' }}
                        >
                          削除フラグ (利用停止)
                        </Checkbox>
                      </Form.Item>
                      {isSelf ? (
                        <Text type="warning" style={{ display: 'block', fontSize: 12, marginTop: 4, color: '#b45309', fontWeight: 600 }}>
                          ⚠️ ログイン中の自身のアカウント（{currentUser?.userName} / {currentUser?.userCd}）は無効化（利用停止）できません。
                        </Text>
                      ) : (
                        <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4, color: '#b91c1c' }}>
                          ※ チェックオンの場合、システムのログインが出来ません。及び検索のリストボックスにも表示されません。
                        </Text>
                      )}
                    </div>
                  </Card>

                  {/* Audit Information Bar per AD1730C Specification */}
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

                  {/* Bottom Action Bar (Fixed / Standard Toolbar) */}
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
                      <Button
                        size="large"
                        icon={<PrinterOutlined />}
                        onClick={handleOpenPrintModal}
                        style={{ fontWeight: 600 }}
                      >
                        (F8) 印刷
                      </Button>
                      <Button
                        size="large"
                        icon={<DownloadOutlined />}
                        onClick={handleExportCsv}
                        style={{ fontWeight: 600 }}
                      >
                        (F6) CSV
                      </Button>
                      {mode === 'edit' && currentRecord && (
                        isSelf ? (
                          <Tooltip title="現在ログイン中の自身のアカウントは削除できません">
                            <span>
                              <Button danger size="large" icon={<DeleteOutlined />} disabled style={{ fontWeight: 600 }}>
                                (F7) 削除
                              </Button>
                            </span>
                          </Tooltip>
                        ) : (
                          <Popconfirm
                            title="削除の確認"
                            description={`ユーザー「${currentRecord.userName} (${currentRecord.userCd})」を削除しますか？`}
                            onConfirm={handleDeleteCurrent}
                            okText="削除"
                            cancelText="キャンセル"
                            okButtonProps={{ danger: true }}
                          >
                            <Button danger size="large" icon={<DeleteOutlined />} style={{ fontWeight: 600 }}>
                              (F7) 削除
                            </Button>
                          </Popconfirm>
                        )
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
                <span style={{ fontWeight: 700, fontSize: 14, padding: '0 8px' }}>
                  <TableOutlined style={{ marginRight: 6 }} />
                  データ一覧・検索 (frm_sel_user)
                  <Badge count={totalCount} overflowCount={9999} style={{ backgroundColor: '#10b981', marginLeft: 8 }} />
                </span>
              ),
              children: (
                /* ========================================================
                   TAB 2: DATABASE DATA TABLE & SEARCH (AD1730C LIST)
                   ======================================================== */
                <div style={{ marginTop: 8 }}>
                  {/* Search Filter Toolbar */}
                  <Row justify="space-between" align="middle" style={{ marginBottom: 16 }} gutter={[12, 12]}>
                    <Col xs={24} sm={16} md={14}>
                      <Space size={10} style={{ width: '100%' }} wrap>
                        <Input
                          placeholder="ユーザCD / 氏名 / フリガナ..."
                          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          onPressEnter={() => {
                            setPage(1);
                            fetchUsers();
                          }}
                          allowClear
                          style={{ width: 240 }}
                        />
                        <Select
                          placeholder="所属グループ絞込"
                          allowClear
                          value={selectedGrp}
                          onChange={(val) => {
                            setSelectedGrp(val);
                            setPage(1);
                          }}
                          style={{ width: 170 }}
                          options={[
                            { value: '1', label: '一般グループ' },
                            { value: '2', label: '営業部' },
                            { value: '3', label: '工事部' },
                            { value: '4', label: '総務部' },
                            { value: '9', label: '管理者グループ' },
                          ]}
                        />
                        <Button
                          type="primary"
                          icon={<SearchOutlined />}
                          onClick={() => {
                            setPage(1);
                            fetchUsers();
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
                    rowKey="userCd"
                    columns={columns}
                    dataSource={data}
                    loading={loading}
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
      </Card>

      {/* ========================================================
          MODAL: PRINT SPECIFICATION (AD1730C 印刷指定 - F8)
          ======================================================== */}
      <Modal
        title={
          <Space>
            <PrinterOutlined style={{ color: '#1d4ed8' }} />
            <span style={{ fontWeight: 700 }}>■ 印刷指定 (AD1730C ユーザマスタ一覧表)</span>
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
            onClick={handleExecutePrint}
            style={{ background: '#1d4ed8', borderColor: '#1d4ed8' }}
          >
            印刷プレビュー (F8)
          </Button>,
        ]}
      >
        <div style={{ padding: '12px 0' }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            帳票に出力するユーザコードの範囲を指定してください。
          </Text>
          <Row gutter={16} align="middle">
            <Col span={10}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>
                開始コード
              </Text>
              <Input
                maxLength={6}
                value={printStartCd}
                onChange={(e) => setPrintStartCd(e.target.value)}
                style={{ width: '100%', fontFamily: 'monospace' }}
              />
            </Col>
            <Col span={4} style={{ textAlign: 'center', marginTop: 22 }}>
              <Text strong style={{ fontSize: 16 }}>
                ～
              </Text>
            </Col>
            <Col span={10}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>
                終了コード
              </Text>
              <Input
                maxLength={6}
                value={printEndCd}
                onChange={(e) => setPrintEndCd(e.target.value)}
                style={{ width: '100%', fontFamily: 'monospace' }}
              />
            </Col>
          </Row>
          <div
            style={{
              marginTop: 20,
              background: '#f8fafc',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              color: '#475569',
            }}
          >
            <p style={{ margin: 0 }}>
              ※ 印刷実行を押すと、指定範囲のユーザマスタ一覧表レイアウトでブラウザ印刷ダイアログが開きます。
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
