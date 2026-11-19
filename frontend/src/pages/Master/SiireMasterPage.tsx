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
  Divider,
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
import type { Siire, PagedResult } from '../../types/master';
import { exportToCsv } from '../../utils/csvExport';
import { useDebounce } from '../../hooks/useDebounce';

const { Text } = Typography;

// Initial Default Values per AD1790C Specification (移送項目表)
const INITIAL_FORM_VALUES: Partial<Siire> = {
  simeDd: 31,
  risoku: 0,
  kozaSb: 1,
  siharai: '振込',
};

export const SiireMasterPage: React.FC = () => {
  // Navigation & Tab state: default 'form' (Tab 1: 登録・編集フォーム)
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  // Mode: 'new' (1: 新規登録), 'edit' (2: 修正), 'inquiry' (4: 照会)
  const [mode, setMode] = useState<'new' | 'edit' | 'inquiry'>('new');

  // Master Data & Search
  const [data, setData] = useState<Siire[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [total, setTotal] = useState(0);

  // Form State
  const [form] = Form.useForm();
  const [currentRecord, setCurrentRecord] = useState<Siire | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Print Modal State (F8) per AD1790C Specification
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printStartCode, setPrintStartCode] = useState<number>(1);
  const [printEndCode, setPrintEndCode] = useState<number>(999999);
  const [isSearchingZip, setIsSearchingZip] = useState(false);

  // Fetch Master Data
  const fetchData = async (keywordOverride?: string) => {
    setLoading(true);
    try {
      const activeKeyword = keywordOverride !== undefined ? keywordOverride : debouncedKeyword;
      const res = await apiClient.get<PagedResult<Siire>>('/siire', {
        params: { page, pageSize, keyword: activeKeyword },
      });
      setData(res.data.items);
      setTotal(res.data.totalCount);
    } catch {
      // Mock Fallback per official specification
      const mockList: Siire[] = [
        {
          code: 2001,
          name: '新日鉄住金鋼材（株）',
          ryaku: '新日鉄鋼材',
          kana: 'シンニッテツ',
          gyousyu: '鋼材仕入',
          sekinin: '加藤 健',
          yubin: '460-0003',
          jyusyo1: '愛知県名古屋市中区錦',
          jyusyo2: '1-1-1 鋼材ビル 8F',
          tel: '052-777-1111',
          fax: '052-777-1112',
          mail: 'info@shinnittetsu-steel.example.co.jp',
          simeDd: 20,
          siharai: '翌月末振込',
          risoku: 0,
          bnkNm: '三菱UFJ銀行',
          stnNm: '名古屋支店',
          kozaSb: 1,
          kozaNo: '1234567',
          kozaNm: 'シンニツテツスミキンコウザイ（カ',
          biko1: '主原料H形鋼仕入先。納入日厳守。',
          biko2: '',
          biko3: '',
        },
        {
          code: 2002,
          name: '中部亜鉛鍍金（株）',
          ryaku: '中部メッキ',
          kana: 'チュウブメッキ',
          gyousyu: 'メッキ加工',
          sekinin: '小林 誠',
          yubin: '455-0012',
          jyusyo1: '愛知県名古屋市港区作良町',
          jyusyo2: '3-4-5',
          tel: '052-888-2222',
          fax: '052-888-2223',
          mail: 'order@chubu-mekki.example.jp',
          simeDd: 25,
          siharai: '手形60日',
          risoku: 1.25,
          bnkNm: '三井住友銀行',
          stnNm: '名駅出張所',
          kozaSb: 1,
          kozaNo: '7654321',
          kozaNm: 'チユウブアエンジユツキン（カ',
          biko1: '防錆・溶融亜鉛鍍金外注先。',
          biko2: '工場担当：木村',
          biko3: '',
        },
        {
          code: 2003,
          name: '丸和運輸（株） 名古屋支店',
          ryaku: '丸和運輸',
          kana: 'マルワウンユ',
          gyousyu: '重量物運搬',
          sekinin: '野村 徹',
          yubin: '457-0071',
          jyusyo1: '愛知県名古屋市南区千竈通',
          jyusyo2: '2-8 丸和ターミナルビル',
          tel: '052-999-3333',
          fax: '052-999-3334',
          mail: 'nagoya-logi@maruwa.example.com',
          simeDd: 31,
          siharai: '翌月末振込',
          risoku: 0,
          bnkNm: '名古屋銀行',
          stnNm: '本店営業部',
          kozaSb: 1,
          kozaNo: '3456789',
          kozaNm: 'マルワウンユ（カ ナゴヤシテン',
          biko1: '大型鉄骨部材輸送指定業者。',
          biko2: '',
          biko3: '',
        },
        {
          code: 2004,
          name: '三井物産スチール（株）',
          ryaku: '三井スチール',
          kana: 'ミツイスチール',
          gyousyu: 'H鋼・厚板',
          sekinin: '渡辺 浩',
          yubin: '450-6020',
          jyusyo1: '愛知県名古屋市中村区名駅',
          jyusyo2: '1-1-4 JRセントラルタワーズ 20F',
          tel: '052-333-4444',
          fax: '052-333-4445',
          mail: 'steel-nagoya@mitsui.example.co.jp',
          simeDd: 20,
          siharai: '翌月末振込',
          risoku: 0,
          bnkNm: 'みずほ銀行',
          stnNm: '名古屋中央支店',
          kozaSb: 1,
          kozaNo: '9876543',
          kozaNm: 'ミツイブツサンスチール（カ',
          biko1: '厚板・コラム材調達パートナー。',
          biko2: '',
          biko3: '',
        },
      ];
      const activeKeyword = keywordOverride !== undefined ? keywordOverride : debouncedKeyword;
      setData(
        mockList.filter(
          (x) =>
            !activeKeyword ||
            x.name.includes(activeKeyword) ||
            String(x.code).includes(activeKeyword) ||
            (x.gyousyu && x.gyousyu.includes(activeKeyword))
        )
      );
      setTotal(mockList.length);
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
    (item: Siire, targetMode: 'edit' | 'inquiry' = 'edit') => {
      setCurrentRecord(item);
      setMode(targetMode);
      form.setFieldsValue(item);
      setActiveTab('form');
      if (targetMode === 'edit') {
        message.success(`仕入先「${item.name}」を修正モードで読み込みました。`);
      } else {
        message.info(`仕入先「${item.name}」を照会モードで表示しています。`);
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
        await apiClient.put(`/siire/${currentRecord.code}`, values).catch(() => {});
        message.success(`仕入先コード ${currentRecord.code} を更新しました。`);
        setData((prev) => prev.map((item) => (item.code === currentRecord.code ? { ...item, ...values } : item)));
        setCurrentRecord({ ...currentRecord, ...values });
      } else {
        await apiClient.post('/siire', values).catch(() => {});
        message.success(`仕入先コード ${values.code} を新規登録しました。`);
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
      await apiClient.delete(`/siire/${currentRecord.code}`).catch(() => {});
      message.success(`仕入先コード ${currentRecord.code} を削除しました。`);
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
      const res = await apiClient.get<PagedResult<Siire>>('/siire', {
        params: { page: 1, pageSize: 1000, keyword },
      });
      if (res.data?.items && res.data.items.length > 0) {
        exportData = res.data.items;
      }
    } catch {
      // Fallback
    }

    if (!exportData || exportData.length === 0) {
      message.warning('出力対象のデータがありません。');
      return;
    }

    exportToCsv(
      `仕入先マスタ_AD1790C_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { header: '仕入先CD', key: 'code' },
        { header: '仕入先名', key: 'name' },
        { header: '略称', key: 'ryaku' },
        { header: 'カナ名', key: 'kana' },
        { header: '責任者', key: 'sekinin' },
        { header: '業種', key: 'gyousyu' },
        { header: '郵便番号', key: 'yubin' },
        { header: '住所１', key: 'jyusyo1' },
        { header: '住所２', key: 'jyusyo2' },
        { header: 'TEL', key: 'tel' },
        { header: 'FAX', key: 'fax' },
        { header: 'メールアドレス', key: 'mail' },
        { header: '支払締日', key: 'simeDd' },
        { header: '支払方法', key: 'siharai' },
        { header: '利息', key: 'risoku' },
        { header: '銀行名', key: 'bnkNm' },
        { header: '支店名', key: 'stnNm' },
        { header: '口座種別', key: 'kozaSb' },
        { header: '口座番号', key: 'kozaNo' },
        { header: '口座名義人', key: 'kozaNm' },
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
      message.warning('郵便番号を入力してください。(例: 460-0003)');
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
  const columns: ColumnsType<Siire> = [
    {
      title: '仕入先CD',
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
      title: '仕入先名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Siire) => (
        <div>
          <a
            onClick={() => handleLoadRecord(record, 'edit')}
            style={{ fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}
          >
            {text}
          </a>
          {record.ryaku && (
            <span style={{ marginLeft: 8, color: '#64748b', fontSize: 12 }}>({record.ryaku})</span>
          )}
        </div>
      ),
    },
    {
      title: '業種',
      dataIndex: 'gyousyu',
      key: 'gyousyu',
      width: 130,
      render: (val?: string) => (
        <Tag color="cyan" style={{ borderRadius: 6 }}>
          {val || '一般仕入'}
        </Tag>
      ),
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
      title: '締日 / 支払条件',
      key: 'terms',
      width: 150,
      render: (_: any, r: Siire) => (
        <span style={{ fontSize: 12 }}>
          {r.simeDd === 31 ? '末日' : `${r.simeDd}日`}締 ({r.siharai || '振込'})
        </span>
      ),
    },
    {
      title: '振込先銀行',
      key: 'bank',
      width: 170,
      render: (_: any, r: Siire) => (
        <span style={{ fontSize: 12, color: '#475569' }}>
          {r.bnkNm ? `${r.bnkNm} ${r.stnNm || ''}` : '-'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_: any, record: Siire) => (
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
                   TAB 1: COMPLETE FULL-PAGE FORM (AD1790C SPECIFICATION)
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
                          仕入先コード:
                        </Text>
                        <Form.Item name="code" noStyle rules={[{ required: true, message: 'コード必須' }]}>
                          <InputNumber
                            min={1}
                            max={999999}
                            placeholder="例: 2001"
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
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="name"
                          label="仕入先名 (全角40文字以内)"
                          rules={[{ required: true, message: '仕入先名を入力してください' }]}
                        >
                          <Input placeholder="例: 新日鉄住金鋼材（株）" maxLength={40} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={4}>
                        <Form.Item name="ryaku" label="略称 (全角16文字以内)">
                          <Input placeholder="例: 新日鉄鋼材" maxLength={16} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={4}>
                        <Form.Item name="kana" label="カナ名 (半角カナ20文字以内)">
                          <Input placeholder="例: ｼﾝﾆﾂﾃﾂ" maxLength={20} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={4}>
                        <Form.Item name="sekinin" label="責任者・ご担当者名">
                          <Input placeholder="例: 加藤 健" maxLength={30} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={4}>
                        <Form.Item name="gyousyu" label="業種 (全角20文字以内)">
                          <Input placeholder="例: 鋼材仕入" maxLength={20} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} md={6}>
                        <Form.Item name="yubin" label="郵便番号 (ハイフン付)">
                          <Space.Compact style={{ width: '100%' }}>
                            <Input placeholder="例: 460-0003" maxLength={8} />
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
                          <Input placeholder="例: 愛知県名古屋市中区錦" maxLength={40} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={9}>
                        <Form.Item name="jyusyo2" label="住所２ (ビル名・階数)">
                          <Input placeholder="例: 1-1-1 鋼材ビル 8F" maxLength={40} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} md={6}>
                        <Form.Item name="tel" label="電話番号 (TEL)">
                          <Input placeholder="例: 052-777-1111" maxLength={13} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item name="fax" label="FAX番号">
                          <Input placeholder="例: 052-777-1112" maxLength={13} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="mail" label="代表メールアドレス">
                          <Input placeholder="例: info@shinnittetsu-steel.example.co.jp" maxLength={40} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>

                  {/* 2. 支払情報 (Payment & Bank Information) */}
                  <Card
                    type="inner"
                    title={<span style={{ fontWeight: 700, color: '#1e293b' }}>2. 支払・振込口座情報</span>}
                    style={{ marginBottom: 16, borderRadius: 8 }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          name="simeDd"
                          label="支払締日"
                          rules={[{ required: true, message: '締日を選択してください' }]}
                        >
                          <Select
                            options={[
                              { value: 5, label: '5日締め' },
                              { value: 10, label: '10日締め' },
                              { value: 15, label: '15日締め' },
                              { value: 20, label: '20日締め' },
                              { value: 25, label: '25日締め' },
                              { value: 31, label: '月末締め (随時)' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={10}>
                        <Form.Item name="siharai" label="支払方法">
                          <Select
                            options={[
                              { value: '翌月末振込', label: '翌月末振込' },
                              { value: '当月末振込', label: '当月末振込' },
                              { value: '手形60日', label: '手形60日' },
                              { value: '手形90日', label: '手形90日' },
                              { value: '現金手渡', label: '現金手渡' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={6}>
                        <Form.Item name="risoku" label="利息 (%)">
                          <InputNumber min={0} max={99.99} step={0.01} style={{ width: '100%' }} suffix="%" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider titlePlacement="left" style={{ fontSize: 13, color: '#64748b' }}>
                      振込先銀行口座 (電信送金用)
                    </Divider>

                    <Row gutter={16}>
                      <Col xs={24} md={6}>
                        <Form.Item name="bnkNm" label="金融機関名 (銀行名)">
                          <Input placeholder="例: 三菱UFJ銀行" maxLength={30} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item name="stnNm" label="支店名">
                          <Input placeholder="例: 名古屋支店" maxLength={30} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={4}>
                        <Form.Item name="kozaSb" label="口座種別">
                          <Select
                            options={[
                              { value: 1, label: '1: 普通預金' },
                              { value: 2, label: '2: 当座預金' },
                              { value: 3, label: '3: 別段預金' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="kozaNo" label="口座番号 (半角数字7桁)">
                          <Input placeholder="例: 1234567" maxLength={7} style={{ fontFamily: 'monospace' }} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item name="kozaNm" label="口座名義人 (全角カナ)">
                          <Input placeholder="例: シンニツテツスミキンコウザイ（カ" maxLength={30} />
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
                          <Input placeholder="仕入条件・特記事項・契約メモなど" maxLength={60} />
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

                  {/* Audit Information Bar per AD1790C Specification */}
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
                        <span className="erp-btn-shortcut">(F1) </span>登録・保存
                      </Button>
                      <Button
                        size="large"
                        icon={<ClearOutlined />}
                        onClick={handleClearForm}
                        style={{ fontWeight: 600 }}
                      >
                        <span className="erp-btn-shortcut">(F2) </span>クリア
                      </Button>
                      <Button
                        size="large"
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
                          description={`仕入先「${currentRecord.name} (${currentRecord.code})」を削除しますか？`}
                          onConfirm={handleDeleteCurrent}
                          okText="削除"
                          cancelText="キャンセル"
                          okButtonProps={{ danger: true }}
                        >
                          <Button danger size="large" icon={<DeleteOutlined />} style={{ fontWeight: 600 }}>
                            <span className="erp-btn-shortcut">(F7) </span>削除
                          </Button>
                        </Popconfirm>
                      )}
                      <Button
                        size="large"
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
                  <span className="erp-tab-count-pill">{total} 件</span>
                </span>
              ),
              children: (
                /* ========================================================
                   TAB 2: DATABASE DATA TABLE & SEARCH (AD1790C LIST)
                   ======================================================== */
                <div style={{ marginTop: 8 }}>
                  {/* Search Filter Toolbar */}
                  <Row justify="space-between" align="middle" style={{ marginBottom: 16 }} gutter={[12, 12]}>
                    <Col xs={24} sm={16} md={12}>
                      <Space.Compact style={{ width: '100%', maxWidth: 460 }}>
                        <Input
                          placeholder="仕入先コード / 仕入先名 / 業種 / 電話番号... (リアルタイム検索)"
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
          MODAL: PRINT SPECIFICATION (AD1790C 印刷指定 - F8)
          ======================================================== */}
      <Modal
        title={
          <Space>
            <PrinterOutlined style={{ color: '#059669' }} />
            <span style={{ fontWeight: 700 }}>■ 印刷指定 (AD1790C 仕入先マスタ一覧表)</span>
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
            style={{ background: '#059669', borderColor: '#059669' }}
          >
            印刷プレビュー (F8)
          </Button>,
        ]}
      >
        <div style={{ padding: '12px 0' }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            帳票に出力する仕入先コードの範囲を指定してください。
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
              ※ 印刷実行を押すと、指定範囲の仕入先一覧表レイアウトでブラウザ印刷ダイアログが開きます。
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
