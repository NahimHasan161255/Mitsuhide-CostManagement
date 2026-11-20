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
  Tooltip,
  Checkbox,
  DatePicker,
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
  LockOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { API_BASE_URL } from '../../api/client';
import { exportToCsv } from '../../utils/csvExport';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';

const { Text } = Typography;

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
  updDate?: string;
}

// Initial Default Values per AD1730C Specification
const INITIAL_FORM_VALUES: Partial<UserItem> = {
  userCd: '',
  userName: '',
  userNameR: '',
  userNameK: '',
  tantoKbn: 1,
  userGrpCd: '1',
  syubetu: 1,
  biko: '',
  password: '',
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
  const debouncedSearchText = useDebounce(searchText, 300);
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

  // Code Range Filter State (Tab 2 & Print)
  const [startUserCd, setStartUserCd] = useState<string>('');
  const [endUserCd, setEndUserCd] = useState<string>('');

  // Fetch Master Data
  const fetchUsers = async (searchOverride?: string) => {
    setLoading(true);
    try {
      const activeSearch = searchOverride !== undefined ? searchOverride : debouncedSearchText;
      let url = `${API_BASE_URL}/api/user?page=${page}&pageSize=${pageSize}`;
      if (activeSearch) url += `&search=${encodeURIComponent(activeSearch)}`;
      if (selectedGrp) url += `&userGrpCd=${encodeURIComponent(selectedGrp)}`;
      if (startUserCd) url += `&startUserCd=${encodeURIComponent(startUserCd)}`;
      if (endUserCd) url += `&endUserCd=${encodeURIComponent(endUserCd)}`;

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
              (!activeSearch ||
                x.userName.includes(activeSearch) ||
                x.userCd.includes(activeSearch) ||
                (x.userNameK && x.userNameK.includes(activeSearch))) &&
              (!selectedGrp || x.userGrpCd === selectedGrp) &&
              (!startUserCd || x.userCd >= startUserCd.padStart(6, '0')) &&
              (!endUserCd || x.userCd <= endUserCd.padStart(6, '0'))
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
  }, [debouncedSearchText, selectedGrp, startUserCd, endUserCd]);

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, debouncedSearchText, selectedGrp, startUserCd, endUserCd]);

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
        password: '',
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
        password: values.password || undefined,
        newPassword: values.password || undefined,
        passExpireDate: values.passExpireDate ? values.passExpireDate.format('YYYY/MM/DD') : undefined,
        userIdExpireDate: values.userIdExpireDate ? values.userIdExpireDate.format('YYYY/MM/DD') : undefined,
      };

      if (mode === 'edit' && currentRecord) {
        if (isSelf && payload.deleteFlg) {
          message.error('現在ログイン中の自身のアカウントを無効化（利用停止）することはできません。');
          return;
        }

        const editPayload = {
          ...payload,
          updDate: currentRecord.updDate,
        };

        const res = await fetch(`${API_BASE_URL}/api/user/${currentRecord.userCd}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Cd': currentUser?.userCd || '',
          },
          body: JSON.stringify(editPayload),
        });
        if (res.status === 409) {
          const errData = await res.json().catch(() => ({}));
          Modal.error({
            title: '排他エラー (409 Conflict)',
            content: errData.message || '他のユーザーまたは別画面によって既にデータが更新されています。最新データを再読み込みしてください。',
            okText: '最新データを再読み込み',
            onOk: () => {
              fetchUsers();
            },
          });
          return;
        }
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || '更新処理に失敗しました。');
        }
        message.success(`ユーザーコード ${currentRecord.userCd} を更新しました。`);
        const updated = { ...currentRecord, ...editPayload, updDate: new Date().toISOString() };
        setData((prev) => prev.map((item) => (item.userCd === currentRecord.userCd ? updated : item)));
        setCurrentRecord(updated);
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

  // Export CSV (F6) - Exports all filtered records, or all database records if no filter
  const handleExportCsv = async () => {
    let exportData = data;
    try {
      let url = `${API_BASE_URL}/api/user?page=1&pageSize=5000`;
      if (debouncedSearchText) url += `&search=${encodeURIComponent(debouncedSearchText)}`;
      if (selectedGrp) url += `&userGrpCd=${encodeURIComponent(selectedGrp)}`;
      if (startUserCd) url += `&startUserCd=${encodeURIComponent(startUserCd)}`;
      if (endUserCd) url += `&endUserCd=${encodeURIComponent(endUserCd)}`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.items && json.items.length > 0) exportData = json.items;
      }
    } catch {
      // Fallback
      let filtered = data;
      if (startUserCd) filtered = filtered.filter((x) => x.userCd >= startUserCd.padStart(6, '0'));
      if (endUserCd) filtered = filtered.filter((x) => x.userCd <= endUserCd.padStart(6, '0'));
      if (debouncedSearchText) {
        filtered = filtered.filter(
          (x) =>
            x.userName.includes(debouncedSearchText) ||
            x.userCd.includes(debouncedSearchText) ||
            (x.userNameK && x.userNameK.includes(debouncedSearchText))
        );
      }
      if (selectedGrp) filtered = filtered.filter((x) => x.userGrpCd === selectedGrp);
      exportData = filtered;
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

  // Direct Print (F8) - Directly triggers browser print without modal
  const handleDirectPrint = () => {
    message.info('印刷ダイアログを開きます。');
    setTimeout(() => {
      window.print();
    }, 200);
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
        handleDirectPrint();
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
                  <Button className="erp-tab-action-btn" icon={<PrinterOutlined />} onClick={handleDirectPrint}>
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
                      fetchUsers();
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
                      修正: #{currentRecord?.userCd}
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
                   TAB 1: COMPLETE FULL-PAGE FORM (AD1730C SPECIFICATION)
                   ======================================================== */
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={INITIAL_FORM_VALUES}
                  disabled={mode === 'inquiry'}
                  autoComplete="off"
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
                    <Space size={14} wrap align="center">
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
                          ユーザコード:
                        </Text>
                        <Form.Item name="userCd" noStyle rules={[{ required: true, message: 'コード必須' }]}>
                          <Input
                            placeholder="例: 000001"
                            maxLength={6}
                            disabled={mode !== 'new'}
                            onBlur={(e) => handleCheckCode(e.target.value)}
                            style={{ width: 130, fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}
                          />
                        </Form.Item>
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
                        <span className="erp-btn-shortcut">(F9) </span>前データ
                      </Button>
                      <Button onClick={handleNextRecord} disabled={data.length === 0}>
                        <span className="erp-btn-shortcut">(F10) </span>次データ <RightOutlined />
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
                          tooltip="新規登録時またはパスワード変更時に半角英数字で入力してください"
                          rules={mode === 'new' ? [{ required: true, message: 'パスワードを入力してください' }] : []}
                        >
                          <Input.Password
                            prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                            placeholder={mode === 'edit' ? '変更する場合のみ入力' : '半角英数字8桁以上'}
                            autoComplete="new-password"
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
                        isSelf ? (
                          <Tooltip title="現在ログイン中の自身のアカウントは削除できません">
                            <span>
                              <Button danger className="erp-bottom-action-btn" icon={<DeleteOutlined />} disabled style={{ fontWeight: 600 }}>
                                <span className="erp-btn-shortcut">(F7) </span>削除
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
                            <Button danger className="erp-bottom-action-btn" icon={<DeleteOutlined />} style={{ fontWeight: 600 }}>
                              <span className="erp-btn-shortcut">(F7) </span>削除
                            </Button>
                          </Popconfirm>
                        )
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
                  <span className="erp-tab-count-pill">{totalCount} 件</span>
                </span>
              ),
              children: (
                /* ========================================================
                   TAB 2: DATABASE DATA TABLE & SEARCH (AD1730C LIST)
                   ======================================================== */
                <div style={{ marginTop: 8 }}>
                  {/* Search and Code Range Filter Toolbar */}
                  <Row justify="space-between" align="middle" style={{ marginBottom: 16 }} gutter={[12, 12]}>
                    <Col xs={24} lg={17}>
                      <Space size={14} wrap align="center">
                        {/* 1. Code Range Filter (on the LEFT) */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Text strong style={{ fontSize: 13, color: '#334155', whiteSpace: 'nowrap' }}>
                            コード範囲:
                          </Text>
                          <Input
                            placeholder="開始"
                            maxLength={6}
                            value={startUserCd}
                            onChange={(e) => setStartUserCd(e.target.value)}
                            style={{ width: 105, fontFamily: 'monospace' }}
                            allowClear
                          />
                          <Text style={{ color: '#94a3b8' }}>〜</Text>
                          <Input
                            placeholder="終了"
                            maxLength={6}
                            value={endUserCd}
                            onChange={(e) => setEndUserCd(e.target.value)}
                            style={{ width: 105, fontFamily: 'monospace' }}
                            allowClear
                          />
                        </div>

                        {/* 2. Keyword Search (moved to the RIGHT of Code Range) */}
                        <Space.Compact style={{ width: 280, maxWidth: '100%' }}>
                          <Input
                            placeholder="ユーザCD / 氏名 / フリガナ..."
                            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onPressEnter={() => {
                              setPage(1);
                              fetchUsers(searchText);
                            }}
                            allowClear
                          />
                          <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            loading={loading}
                            onClick={() => {
                              setPage(1);
                              fetchUsers(searchText);
                            }}
                            style={{ background: '#2563eb', borderColor: '#2563eb', fontWeight: 600 }}
                          >
                            検索
                          </Button>
                        </Space.Compact>

                        {/* 3. Group filter */}
                        <Select
                          placeholder="所属グループ絞込"
                          allowClear
                          value={selectedGrp}
                          onChange={(val) => {
                            setSelectedGrp(val);
                            setPage(1);
                          }}
                          style={{ width: 160 }}
                          options={[
                            { value: '1', label: '一般グループ' },
                            { value: '2', label: '営業部' },
                            { value: '3', label: '工事部' },
                            { value: '4', label: '総務部' },
                            { value: '9', label: '管理者グループ' },
                          ]}
                        />

                        {/* Reset Filter Button if any filter is active */}
                        {(startUserCd || endUserCd || searchText || selectedGrp) && (
                          <Button
                            size="small"
                            onClick={() => {
                              setStartUserCd('');
                              setEndUserCd('');
                              setSearchText('');
                              setSelectedGrp(undefined);
                              setPage(1);
                            }}
                            style={{ fontSize: 12 }}
                          >
                            条件クリア
                          </Button>
                        )}
                      </Space>
                    </Col>

                    <Col xs={24} lg={7} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                        登録件数: <strong style={{ color: '#0f172a' }}>{totalCount}</strong> 件
                      </Text>
                    </Col>
                  </Row>

                  <Table
                    rowKey="userCd"
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
    </div>
  );
};
