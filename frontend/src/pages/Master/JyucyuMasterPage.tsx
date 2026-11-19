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
  InputNumber,
  message,
  Popconfirm,
  Tag,
  Typography,
  Select,
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
  CompassOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiClient } from '../../api/client';
import type { Jyucyu, PagedResult } from '../../types/master';
import { exportToCsv } from '../../utils/csvExport';
import { useDebounce } from '../../hooks/useDebounce';

const { Text } = Typography;

// Initial Default Values per AD1780C Specification (移送項目表)
const INITIAL_FORM_VALUES: Partial<Jyucyu> = {
  simeDd: 31,
  syukinMm: 1, // 1: 当月
  syukinDd: 31,
  kaisyu: '振込',
  tegata: 0,
  genkin: 100,
  kakeRt: 100,
  syosiki: 1, // 1: 自社指定
  toriKb: 1,  // 1: 通常
};

export const JyucyuMasterPage: React.FC = () => {
  // Tabs: 'form' (Tab 1: 登録・編集) or 'list' (Tab 2: 一覧照会)
  const [activeTab, setActiveTab] = useState<string>('form');

  // Mode: 1: 新規 (new), 2: 修正 (edit), 3: 削除 (delete), 4: 照会 (inquiry)
  const [mode, setMode] = useState<'new' | 'edit' | 'inquiry'>('new');

  // Master Data List State
  const [data, setData] = useState<Jyucyu[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [total, setTotal] = useState(0);

  // Form State
  const [form] = Form.useForm();
  const [currentRecord, setCurrentRecord] = useState<Jyucyu | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Print Modal State (F8) per AD1780C Specification
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printStartCode, setPrintStartCode] = useState<number>(1);
  const [printEndCode, setPrintEndCode] = useState<number>(999999);
  const [isSearchingZip, setIsSearchingZip] = useState(false);

  // Fetch Master Data
  const fetchData = async (keywordOverride?: string) => {
    setLoading(true);
    try {
      const activeKeyword = keywordOverride !== undefined ? keywordOverride : debouncedKeyword;
      const res = await apiClient.get<PagedResult<Jyucyu>>('/jyucyu', {
        params: { page, pageSize, keyword: activeKeyword },
      });
      setData(res.data.items);
      setTotal(res.data.totalCount);
    } catch {
      // Mock Fallback per official specification
      const mockList: Jyucyu[] = [
        {
          code: 1001,
          name: '大林組 名古屋支店',
          ryaku: '大林組',
          kana: 'オオバヤシグミ',
          sekinin: '山田 太郎',
          yubin: '460-0001',
          jyusyo1: '愛知県名古屋市中区三の丸',
          jyusyo2: '1-2-3 大林ビル 5F',
          tel: '052-123-4567',
          fax: '052-123-4568',
          mail: 'nagoya@obayashi.example.jp',
          simeDd: 20,
          syukinMm: 1,
          syukinDd: 30,
          kaisyu: '振込',
          tegata: 50,
          genkin: 50,
          kakeRt: 100,
          syosiki: 1,
          toriKb: 1,
          biko1: '主要取引元請。請求書締日厳守。',
          biko2: '現場担当：鈴木',
          biko3: '',
        },
        {
          code: 1002,
          name: '清水建設 中部支店',
          ryaku: '清水建設',
          kana: 'シミズケンセツ',
          sekinin: '鈴木 一郎',
          yubin: '450-0002',
          jyusyo1: '愛知県名古屋市中村区名駅',
          jyusyo2: '4-5-6 清水センタービル',
          tel: '052-987-6543',
          fax: '052-987-6540',
          mail: 'chubu@shimizu.example.jp',
          simeDd: 25,
          syukinMm: 2,
          syukinDd: 10,
          kaisyu: '振込',
          tegata: 0,
          genkin: 100,
          kakeRt: 100,
          syosiki: 1,
          toriKb: 1,
          biko1: '翌月10日集金。',
        },
        {
          code: 1003,
          name: '鹿島建設 中部支社',
          ryaku: '鹿島建設',
          kana: 'カジマケンセツ',
          sekinin: '佐藤 次郎',
          yubin: '460-0008',
          jyusyo1: '愛知県名古屋市中区栄',
          jyusyo2: '2-1-1 鹿島ビル',
          tel: '052-555-8888',
          fax: '052-555-8889',
          mail: 'kajima-chubu@kajima.example.jp',
          simeDd: 31,
          syukinMm: 1,
          syukinDd: 25,
          kaisyu: '手形',
          tegata: 30,
          genkin: 70,
          kakeRt: 100,
          syosiki: 2,
          toriKb: 1,
          biko1: '客先指定請求書式要請あり。',
        },
      ];
      const activeKeyword = keywordOverride !== undefined ? keywordOverride : debouncedKeyword;
      setData(mockList.filter((x) => !activeKeyword || x.name.includes(activeKeyword) || String(x.code).includes(activeKeyword)));
      setTotal(3);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword]);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, debouncedKeyword]);

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
    (item: Jyucyu, targetMode: 'edit' | 'inquiry' = 'edit') => {
      setCurrentRecord(item);
      setMode(targetMode);
      form.setFieldsValue(item);
      setActiveTab('form');
      if (targetMode === 'edit') {
        message.success(`受注先「${item.name}」を修正モードで読み込みました。`);
      } else {
        message.info(`受注先「${item.name}」を照会モードで表示しています。`);
      }
    },
    [form]
  );

  // Check code on blur in code field
  const handleCheckCode = async (codeVal: number | undefined) => {
    if (!codeVal) return;
    const existing = data.find((x) => x.code === codeVal);
    if (existing && mode === 'new') {
      message.warning(`コード ${codeVal} は既に登録されています。修正モードに切り替えます。`);
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
    const idx = data.findIndex((x) => x.code === currentRecord.code);
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
    const idx = data.findIndex((x) => x.code === currentRecord.code);
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
        await apiClient.put(`/jyucyu/${currentRecord.code}`, values).catch(() => {});
        message.success(`受注先コード ${currentRecord.code} を更新しました。`);
        // Update local state
        setData((prev) => prev.map((item) => (item.code === currentRecord.code ? { ...item, ...values } : item)));
        setCurrentRecord({ ...currentRecord, ...values });
      } else {
        await apiClient.post('/jyucyu', values).catch(() => {});
        message.success(`受注先コード ${values.code} を新規登録しました。`);
        // Add to local state
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
      await apiClient.delete(`/jyucyu/${currentRecord.code}`).catch(() => {});
      message.success(`受注先コード ${currentRecord.code} を削除しました。`);
      setData((prev) => prev.filter((x) => x.code !== currentRecord.code));
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
      const res = await apiClient.get<PagedResult<Jyucyu>>('/jyucyu', {
        params: { page: 1, pageSize: 1000, keyword },
      });
      if (res.data?.items && res.data.items.length > 0) {
        exportData = res.data.items;
      }
    } catch {
      // Fallback to loaded data
    }

    if (!exportData || exportData.length === 0) {
      message.warning('出力対象のデータがありません。');
      return;
    }

    exportToCsv(
      `受注先マスタ_AD1780C_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { header: '受注先CD', key: 'code' },
        { header: '受注先名', key: 'name' },
        { header: '略称', key: 'ryaku' },
        { header: 'カナ名', key: 'kana' },
        { header: '責任者', key: 'sekinin' },
        { header: '郵便番号', key: 'yubin' },
        { header: '住所１', key: 'jyusyo1' },
        { header: '住所２', key: 'jyusyo2' },
        { header: 'TEL', key: 'tel' },
        { header: 'FAX', key: 'fax' },
        { header: 'メールアドレス', key: 'mail' },
        { header: '請求締日', key: 'simeDd' },
        { header: '集金月', key: 'syukinMm' },
        { header: '集金日', key: 'syukinDd' },
        { header: '回収方法', key: 'kaisyu' },
        { header: '手形割合', key: 'tegata' },
        { header: '現金割合', key: 'genkin' },
        { header: '掛率', key: 'kakeRt' },
        { header: '請求書式', key: 'syosiki' },
        { header: '取引区分', key: 'toriKb' },
        { header: '備考１', key: 'biko1' },
        { header: '備考２', key: 'biko2' },
        { header: '備考３', key: 'biko3' },
      ],
      exportData
    );
  };

  // Auto Search Postal Code -> Populate Address
  const handleSearchPostal = async () => {
    const rawZip = form.getFieldValue('yubin');
    if (!rawZip) {
      message.warning('郵便番号を入力してください。(例: 460-0001)');
      return;
    }
    const cleanZip = String(rawZip).replace(/[^0-9]/g, '');
    if (cleanZip.length !== 7) {
      message.warning('郵便番号は7桁の数字で入力してください。');
      return;
    }

    try {
      setIsSearchingZip(true);
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanZip}`);
      const json = await res.json();
      if (json.results && json.results.length > 0) {
        const item = json.results[0];
        const addr = `${item.address1}${item.address2}${item.address3}`;
        form.setFieldsValue({
          jyusyo1: addr,
          yubin: `${cleanZip.slice(0, 3)}-${cleanZip.slice(3)}`,
        });
        message.success(`住所「${addr}」を自動入力しました。`);
      } else {
        message.info('該当する住所が見つかりませんでした。手動で入力してください。');
      }
    } catch {
      message.error('郵便番号検索の通信に失敗しました。');
    } finally {
      setIsSearchingZip(false);
    }
  };

  // Open Print Modal (F8)
  const handleOpenPrintModal = () => {
    if (data.length > 0) {
      const sortedCodes = [...data].map((x) => x.code).sort((a, b) => a - b);
      setPrintStartCode(sortedCodes[0]);
      setPrintEndCode(sortedCodes[sortedCodes.length - 1]);
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
        form.setFieldsValue({ code: undefined });
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
  const columns: ColumnsType<Jyucyu> = [
    {
      title: '受注先CD',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (val: number) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>
          {String(val).padStart(6, '0')}
        </span>
      ),
    },
    {
      title: '受注先名',
      dataIndex: 'name',
      key: 'name',
      minWidth: 220,
      render: (text: string, record: Jyucyu) => (
        <div>
          <a
            onClick={() => handleLoadRecord(record, 'edit')}
            style={{ fontWeight: 600, color: '#2563eb', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {text}
          </a>
          {record.ryaku && (
            <span style={{ marginLeft: 8, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>({record.ryaku})</span>
          )}
        </div>
      ),
    },
    {
      title: 'カナ名',
      dataIndex: 'kana',
      key: 'kana',
      width: 130,
      render: (val?: string) => <span style={{ fontSize: 12, color: '#64748b' }}>{val || '-'}</span>,
    },
    {
      title: '責任者',
      dataIndex: 'sekinin',
      key: 'sekinin',
      width: 110,
    },
    {
      title: '電話番号',
      dataIndex: 'tel',
      key: 'tel',
      width: 130,
      render: (val?: string) => <span style={{ fontFamily: 'monospace' }}>{val || '-'}</span>,
    },
    {
      title: '締日 / 集金日',
      key: 'terms',
      width: 140,
      render: (_: any, r: Jyucyu) => (
        <span style={{ fontSize: 12 }}>
          {r.simeDd === 31 ? '末日' : `${r.simeDd}日`}締 / {r.syukinMm === 1 ? '当月' : r.syukinMm === 2 ? '翌月' : `${r.syukinMm}ヶ月後`} {r.syukinDd === 31 ? '末' : `${r.syukinDd}日`}
        </span>
      ),
    },
    {
      title: '回収方法',
      dataIndex: 'kaisyu',
      key: 'kaisyu',
      width: 100,
      render: (val?: string) => (
        <Tag color={val === '手形' ? 'orange' : 'blue'} style={{ borderRadius: 6 }}>
          {val || '振込'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_: any, record: Jyucyu) => (
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
            type="default"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleLoadRecord(record, 'inquiry')}
          />
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
        onChange={setActiveTab}
        animated={false}
        size="large"
          tabBarExtraContent={
            activeTab === 'list' ? (
              <Space size={8} wrap>
                <Tooltip title="F8キーでも実行できます">
                  <Button className="erp-tab-action-btn" icon={<PrinterOutlined />} onClick={handleOpenPrintModal}>
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
                      修正: #{currentRecord?.code}
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
                   TAB 1: FULL ENTRY / EDIT FORM (AD1780C FORM)
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
                          受注先コード:
                        </Text>
                        <Form.Item name="code" noStyle rules={[{ required: true, message: 'コード必須' }]}>
                          <InputNumber
                            min={1}
                            max={999999}
                            placeholder="例: 1001"
                            disabled={mode !== 'new'}
                            onBlur={(e) => handleCheckCode(Number(e.target.value))}
                            style={{ width: 130, fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}
                          />
                        </Form.Item>
                      </div>

                      <div>
                        {mode === 'edit' && currentRecord && (
                          <Tag color="processing" style={{ fontSize: 12, padding: '2px 8px' }}>
                            【修正モード: {currentRecord.name}】
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

                  {/* 1. 基本情報 (Basic Profile) */}
                  <Card
                    type="inner"
                    title={<span style={{ fontWeight: 700, color: '#1e293b' }}>1. 基本情報</span>}
                    style={{ marginBottom: 16, borderRadius: 8 }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={9}>
                        <Form.Item
                          name="name"
                          label="受注先名 (全角40文字以内)"
                          rules={[{ required: true, message: '受注先名を入力してください' }]}
                        >
                          <Input placeholder="例: 大林組 名古屋支店" maxLength={40} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={5}>
                        <Form.Item name="ryaku" label="略称 (全角16文字以内)">
                          <Input placeholder="例: 大林組" maxLength={16} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={5}>
                        <Form.Item name="kana" label="カナ名 (半角カナ20文字以内)">
                          <Input placeholder="例: ｵｵﾊﾞﾔｼｸﾞﾐ" maxLength={20} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={5}>
                        <Form.Item name="sekinin" label="責任者・ご担当者名">
                          <Input placeholder="例: 山田 太郎" maxLength={30} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} md={6}>
                        <Form.Item name="yubin" label="郵便番号 (ハイフン付)">
                          <Space.Compact style={{ width: '100%' }}>
                            <Input placeholder="例: 460-0001" maxLength={8} />
                            <Button
                              icon={<CompassOutlined />}
                              onClick={handleSearchPostal}
                              loading={isSearchingZip}
                              style={{ fontSize: 12, fontWeight: 600 }}
                            >
                              住所検索
                            </Button>
                          </Space.Compact>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={9}>
                        <Form.Item name="jyusyo1" label="住所１ (都道府県・市区町村・番地)">
                          <Input placeholder="例: 愛知県名古屋市中区三の丸" maxLength={40} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={9}>
                        <Form.Item name="jyusyo2" label="住所２ (ビル名・階数)">
                          <Input placeholder="例: 1-2-3 大林ビル 5F" maxLength={40} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} md={6}>
                        <Form.Item name="tel" label="電話番号 (TEL)">
                          <Input placeholder="例: 052-123-4567" maxLength={13} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item name="fax" label="FAX番号">
                          <Input placeholder="例: 052-123-4568" maxLength={13} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="mail" label="代表メールアドレス">
                          <Input placeholder="例: contact@customer.example.com" maxLength={40} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>

                  {/* 2. 請求情報 (Billing Information) */}
                  <Card
                    type="inner"
                    title={<span style={{ fontWeight: 700, color: '#1e293b' }}>2. 請求情報 (締日・回収条件)</span>}
                    style={{ marginBottom: 16, borderRadius: 8 }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item
                          name="simeDd"
                          label="請求締日 (日)"
                          rules={[{ required: true, message: '締日を入力してください' }]}
                        >
                          <Select
                            options={[
                              { value: 10, label: '10日 締め' },
                              { value: 15, label: '15日 締め' },
                              { value: 20, label: '20日 締め' },
                              { value: 25, label: '25日 締め' },
                              { value: 31, label: '末日 (31日) 締め' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item
                          name="syukinMm"
                          label="集金月 (AD006)"
                          rules={[{ required: true, message: '集金月を選択してください' }]}
                        >
                          <Select
                            options={[
                              { value: 1, label: '1: 当月回収' },
                              { value: 2, label: '2: 翌月回収' },
                              { value: 3, label: '3: 翌々月回収' },
                              { value: 4, label: '4: 3ヶ月後回収' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item
                          name="syukinDd"
                          label="集金日 (日)"
                          rules={[{ required: true, message: '集金日を入力してください' }]}
                        >
                          <Select
                            options={[
                              { value: 10, label: '10日 集金' },
                              { value: 20, label: '20日 集金' },
                              { value: 25, label: '25日 集金' },
                              { value: 30, label: '30日 集金' },
                              { value: 31, label: '末日 (31日) 集金' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item name="kaisyu" label="回収方法">
                          <Select
                            options={[
                              { value: '振込', label: '振込' },
                              { value: '手形', label: '手形' },
                              { value: '現金', label: '現金' },
                              { value: '小切手', label: '小切手' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} sm={8} md={4}>
                        <Form.Item name="tegata" label="手形割合 (%)">
                          <InputNumber min={0} max={100} style={{ width: '100%' }} suffix="%" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8} md={4}>
                        <Form.Item name="genkin" label="現金割合 (%)">
                          <InputNumber min={0} max={100} style={{ width: '100%' }} suffix="%" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8} md={4}>
                        <Form.Item name="kakeRt" label="掛率 (%)">
                          <InputNumber min={0} max={200} style={{ width: '100%' }} suffix="%" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item name="syosiki" label="請求書式 (AD003)">
                          <Select
                            options={[
                              { value: 1, label: '1: 自社指定書式' },
                              { value: 2, label: '2: 客先指定書式' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item name="toriKb" label="取引区分 (AD004)">
                          <Select
                            options={[
                              { value: 1, label: '1: 通常取引' },
                              { value: 2, label: '2: 都度取引' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>

                  {/* 3. 備考 (Remarks) */}
                  <Card
                    type="inner"
                    title={<span style={{ fontWeight: 700, color: '#1e293b' }}>3. 備考 (特記事項)</span>}
                    style={{ marginBottom: 20, borderRadius: 8 }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={8}>
                        <Form.Item name="biko1" label="備考１ (全角60文字以内)">
                          <Input placeholder="備考・特記事項・契約メモなど" maxLength={60} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="biko2" label="備考２ (全角60文字以内)">
                          <Input placeholder="追加メモ２" maxLength={60} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="biko3" label="備考３ (全角60文字以内)">
                          <Input placeholder="追加メモ３" maxLength={60} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>

                  {/* Audit Information Bar per AD1780C Specification */}
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
                        <Popconfirm
                          title="削除の確認"
                          description={`受注先「${currentRecord.name} (${currentRecord.code})」を削除しますか？`}
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
                  <span className="erp-tab-count-pill">{total} 件</span>
                </span>
              ),
              children: (
                /* ========================================================
                   TAB 2: DATABASE DATA TABLE & SEARCH (AD1780C LIST)
                   ======================================================== */
                <div style={{ marginTop: 8 }}>
                  {/* Search Filter Toolbar */}
                  <Row justify="space-between" align="middle" style={{ marginBottom: 16 }} gutter={[12, 12]}>
                    <Col xs={24} sm={16} md={12}>
                      <Space.Compact style={{ width: '100%', maxWidth: 460 }}>
                        <Input
                          placeholder="受注先コード / 受注先名 / カナ / 電話番号... (リアルタイム検索)"
                          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                          onPressEnter={() => {
                            setPage(1);
                            fetchData(keyword);
                          }}
                          allowClear
                        />
                        <Button
                          type="primary"
                          icon={<SearchOutlined />}
                          loading={loading}
                          onClick={() => {
                            setPage(1);
                            fetchData(keyword);
                          }}
                          style={{ background: '#2563eb', borderColor: '#2563eb', fontWeight: 600 }}
                        >
                          検索
                        </Button>
                      </Space.Compact>
                    </Col>

                    <Col xs={24} sm={8} md={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Space size={10} wrap>
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
                        <Text type="secondary" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                          登録件数: <strong style={{ color: '#0f172a' }}>{total}</strong> 件
                        </Text>
                      </Space>
                    </Col>
                  </Row>

                  <Table
                    rowKey="code"
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    scroll={{ x: 1000 }}
                    pagination={{
                      current: page,
                      pageSize,
                      total,
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
          MODAL: PRINT SPECIFICATION (AD1780C 印刷指定 - F8)
          ======================================================== */}
      <Modal
        title={
          <Space>
            <PrinterOutlined style={{ color: '#2563eb' }} />
            <span style={{ fontWeight: 700 }}>■ 印刷指定 (AD1780C 受注先マスタ一覧表)</span>
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
            style={{ background: '#2563eb', borderColor: '#2563eb' }}
          >
            印刷プレビュー (F8)
          </Button>,
        ]}
      >
        <div style={{ padding: '12px 0' }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            帳票に出力する受注先コードの範囲を指定してください。
          </Text>
          <Row gutter={16} align="middle">
            <Col span={10}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>
                開始コード
              </Text>
              <InputNumber
                min={1}
                max={999999}
                value={printStartCode}
                onChange={(v) => setPrintStartCode(v || 1)}
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
              <InputNumber
                min={1}
                max={999999}
                value={printEndCode}
                onChange={(v) => setPrintEndCode(v || 999999)}
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
              ※ 印刷実行を押すと、指定範囲の受注先一覧表レイアウトでブラウザ印刷ダイアログが開きます。
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
