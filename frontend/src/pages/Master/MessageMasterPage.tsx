import React, { useState, useEffect } from 'react';
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
  MessageOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { exportToCsv } from '../../utils/csvExport';

const { Title, Text } = Typography;

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
      <Tag color="blue" icon={<QuestionCircleOutlined />} style={{ borderRadius: 6 }}>
        確認 (01000)
      </Tag>
    );
  } else if (num < 3000) {
    return (
      <Tag color="warning" icon={<WarningOutlined />} style={{ borderRadius: 6 }}>
        警告 (02000)
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

export const MessageMasterPage: React.FC = () => {
  const [data, setData] = useState<MessageMasterItem[]>(SEED_MESSAGES);
  const [filteredData, setFilteredData] = useState<MessageMasterItem[]>(SEED_MESSAGES);
  const [loading, setLoading] = useState(false);
  const [selectedSubSys, setSelectedSubSys] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MessageMasterItem | null>(null);
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
          x.msgNo.toLowerCase().includes(q) ||
          x.msg1.toLowerCase().includes(q) ||
          (x.msg2 && x.msg2.toLowerCase().includes(q))
      );
    }
    setFilteredData(result);
  }, [data, selectedSubSys, searchText]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      subSysCd: '共通',
      botanKbn: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: MessageMasterItem) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (msgNo: string) => {
    setData((prev) => prev.filter((x) => x.msgNo !== msgNo));
    message.success(`メッセージ番号 ${msgNo} を削除しました。`);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        setData((prev) =>
          prev.map((item) => (item.msgNo === editingItem.msgNo ? { ...item, ...values } : item))
        );
        message.success(`メッセージ ${values.msgNo} を更新しました。`);
      } else {
        if (data.some((x) => x.msgNo === values.msgNo)) {
          message.error(`メッセージ番号 ${values.msgNo} は既に存在します。`);
          return;
        }
        setData((prev) => [...prev, values]);
        message.success(`メッセージ ${values.msgNo} を新規登録しました。`);
      }
      setIsModalOpen(false);
    } catch {
      // Form validation failed
    }
  };

  const handleExportCsv = () => {
    const columns = [
      { header: 'メッセージ番号', key: 'msgNo' as const },
      { header: 'サブシステム', key: 'subSysCd' as const },
      { header: 'メッセージ１', key: 'msg1' as const },
      { header: 'メッセージ２', key: 'msg2' as const },
      { header: 'デフォルトボタン区分', key: 'botanKbn' as const },
    ];
    exportToCsv(`メッセージマスタ_AD1750C_${new Date().toISOString().slice(0, 10)}.csv`, columns, filteredData);
  };

  const columns: ColumnsType<MessageMasterItem> = [
    {
      title: 'メッセージ番号',
      dataIndex: 'msgNo',
      key: 'msgNo',
      width: 140,
      render: (val: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>{val}</span>
      ),
    },
    {
      title: '分類区分',
      dataIndex: 'msgNo',
      key: 'category',
      width: 150,
      render: (val: string) => getMsgCategoryTag(val),
    },
    {
      title: 'サブシステム',
      dataIndex: 'subSysCd',
      key: 'subSysCd',
      width: 110,
      render: (val: string) => (
        <Tag color={val === '共通' ? 'blue' : 'purple'} style={{ borderRadius: 6, fontWeight: 600 }}>
          {val}
        </Tag>
      ),
    },
    {
      title: 'メッセージ１ (上段表示)',
      dataIndex: 'msg1',
      key: 'msg1',
      render: (val: string) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{val}</span>,
    },
    {
      title: 'メッセージ２ (下段・説明)',
      dataIndex: 'msg2',
      key: 'msg2',
      render: (val?: string) => <span style={{ color: '#64748b' }}>{val || '-'}</span>,
    },
    {
      title: '標準ボタン',
      dataIndex: 'botanKbn',
      key: 'botanKbn',
      width: 110,
      align: 'center',
      render: (val: number) => (
        <Tag color={val === 1 ? 'cyan' : 'default'} style={{ borderRadius: 6 }}>
          {val === 1 ? '1: はい/OK' : '2: いいえ'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 130,
      align: 'center',
      render: (_: any, record: MessageMasterItem) => (
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
            description={`メッセージ「${record.msgNo}」を削除しますか？`}
            onConfirm={() => handleDelete(record.msgNo)}
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
      {/* Header Bar */}
      <Card bodyStyle={{ padding: '16px 24px' }} style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Space align="center" size={12}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MessageOutlined style={{ fontSize: 22, color: '#c026d3' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
                    メッセージマスタ (AD1750C)
                  </Title>
                  <Tag color="purple" style={{ borderRadius: 6, fontWeight: 600 }}>
                    システム保守用
                  </Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  全業務プログラムで表示するダイアログメッセージ、確認ダイアログ、月次警告等の登録保守を行います。
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
                (F1) 新規メッセージ登録
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExportCsv} style={{ fontWeight: 600 }}>
                (F6) CSV出力
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    setData(SEED_MESSAGES);
                    setLoading(false);
                    message.success('メッセージマスタを最新情報に更新しました。');
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
                style={{ width: 140 }}
                options={[
                  { value: '共通', label: '共通メッセージ' },
                  { value: 'MS', label: 'MS: マスタ・月次' },
                  { value: 'GK', label: 'GK: 原価管理' },
                  { value: 'UR', label: 'UR: 売上管理' },
                  { value: 'SR', label: 'SR: 仕入管理' },
                ]}
              />
              <Input
                placeholder="MsgNo / メッセージ内容検索..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ width: 240 }}
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
          rowKey="msgNo"
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          bordered
          size="middle"
        />
      </Card>

      {/* Edit/Create Modal */}
      <Modal
        title={editingItem ? `メッセージ編集 (${editingItem.msgNo})` : '新規メッセージ登録 (AD1750C)'}
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
                name="msgNo"
                label="メッセージ番号 (5桁)"
                rules={[
                  { required: true, message: 'メッセージ番号を入力してください' },
                  { len: 5, message: '5桁で入力してください (例: 01001)' },
                ]}
              >
                <Input placeholder="例: 01001" disabled={!!editingItem} style={{ fontFamily: 'monospace' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="subSysCd"
                label="基本使用サブシステムCD"
                rules={[{ required: true, message: 'サブシステムを選択してください' }]}
              >
                <Select
                  options={[
                    { value: '共通', label: '共通' },
                    { value: 'MS', label: 'MS: マスタ・月次' },
                    { value: 'GK', label: 'GK: 原価管理' },
                    { value: 'UR', label: 'UR: 売上管理' },
                    { value: 'SR', label: 'SR: 仕入管理' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="msg1"
            label="メッセージ１ (ダイアログ上段表示)"
            rules={[{ required: true, message: 'メッセージ１を入力してください' }]}
          >
            <Input placeholder="例: 登録しますか？" />
          </Form.Item>

          <Form.Item name="msg2" label="メッセージ２ (ダイアログ下段・補足説明)">
            <Input.TextArea rows={2} placeholder="補足説明がある場合に入力" />
          </Form.Item>

          <Form.Item name="botanKbn" label="デフォルトボタン区分" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 1, label: '1: はい / OK (肯定)' },
                { value: 2, label: '2: いいえ / キャンセル (慎重)' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
