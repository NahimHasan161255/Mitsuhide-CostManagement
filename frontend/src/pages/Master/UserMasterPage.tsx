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
  UserOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { API_BASE_URL } from '../../api/client';

const { Title, Text } = Typography;

interface UserItem {
  userCd: string;
  userName: string;
  userNameR?: string;
  userNameK?: string;
  tantoKbn: number;
  tantoKbnNm: string;
  userGrpCd?: string;
  userGrpNm?: string;
  syubetu: number;
  syubetuNm: string;
  biko?: string;
  loginDate?: string;
  passUpdDate?: string;
}

export const UserMasterPage: React.FC = () => {
  const [data, setData] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [selectedGrp, setSelectedGrp] = useState<string | undefined>();

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserItem | null>(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/user?page=${page}&pageSize=20`;
      if (searchText) url += `&search=${encodeURIComponent(searchText)}`;
      if (selectedGrp) url += `&userGrpCd=${encodeURIComponent(selectedGrp)}`;

      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        setData(result.items);
        setTotalCount(result.totalCount);
      } else {
        // Mock fallback
        setData([
          {
            userCd: '000001',
            userName: '酒井 太郎',
            userNameR: '酒井',
            userNameK: 'サカイ タロウ',
            tantoKbn: 1,
            tantoKbnNm: '担当者',
            userGrpCd: '9',
            userGrpNm: '管理者グループ',
            syubetu: 1,
            syubetuNm: '営業部',
            biko: 'システム管理者 / 営業統括',
          },
          {
            userCd: '000002',
            userName: '佐藤 次郎',
            userNameR: '佐藤',
            userNameK: 'サトウ ジロウ',
            tantoKbn: 1,
            tantoKbnNm: '担当者',
            userGrpCd: '1',
            userGrpNm: '一般グループ',
            syubetu: 5,
            syubetuNm: '工務部',
            biko: '現場工事主任',
          },
          {
            userCd: '000003',
            userName: '鈴木 花子',
            userNameR: '鈴木',
            userNameK: 'スズキ ハナコ',
            tantoKbn: 9,
            tantoKbnNm: '担当者以外',
            userGrpCd: '1',
            userGrpNm: '一般グループ',
            syubetu: 9,
            syubetuNm: '経理部',
            biko: '月次決算・仕入担当',
          },
        ]);
        setTotalCount(3);
      }
    } catch {
      message.info('ユーザーマスタ取得中 (デモデータ表示)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  useEffect(() => {
    if (isModalOpen) {
      if (editingItem) {
        form.setFieldsValue({ ...editingItem, newPassword: '' });
      } else {
        form.resetFields();
        form.setFieldsValue({
          tantoKbn: 1,
          userGrpCd: '1',
          syubetu: 1,
          password: 'user123',
        });
      }
    }
  }, [isModalOpen, editingItem]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: UserItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await fetch(`${API_BASE_URL}/api/user/${editingItem.userCd}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        message.success(`ユーザー [${editingItem.userCd}] を更新しました。`);
      } else {
        await fetch(`${API_BASE_URL}/api/user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        message.success(`新規ユーザー [${values.userCd}] を登録しました。`);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (userCd: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/user/${userCd}`, { method: 'DELETE' });
      message.success(`ユーザー [${userCd}] を削除しました。`);
      fetchUsers();
    } catch {
      message.error('削除に失敗しました。');
    }
  };

  const columns: ColumnsType<UserItem> = [
    {
      title: '社員CD',
      dataIndex: 'userCd',
      key: 'userCd',
      width: 100,
      render: (val) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: '氏名 / フリガナ',
      dataIndex: 'userName',
      key: 'userName',
      render: (val, r) => (
        <div>
          <Text strong>{val}</Text>
          {r.userNameK && (
            <div style={{ fontSize: 11, color: '#888' }}>{r.userNameK}</div>
          )}
        </div>
      ),
    },
    {
      title: '所属部門',
      dataIndex: 'syubetuNm',
      key: 'syubetuNm',
      width: 120,
      render: (val) => {
        const color = val === '営業部' ? 'green' : val === '工務部' ? 'orange' : 'purple';
        return <Tag color={color}>{val}</Tag>;
      },
    },
    {
      title: 'グループ権限',
      dataIndex: 'userGrpNm',
      key: 'userGrpNm',
      width: 140,
      render: (val, r) => (
        <span>
          {r.userGrpCd === '9' ? (
            <Tag color="magenta">👑 {val || '管理者'}</Tag>
          ) : (
            <Tag color="default">{val || '一般'}</Tag>
          )}
        </span>
      ),
    },
    {
      title: '担当者区分',
      dataIndex: 'tantoKbnNm',
      key: 'tantoKbnNm',
      width: 110,
    },
    {
      title: '備考',
      dataIndex: 'biko',
      key: 'biko',
    },
    {
      title: '操作',
      key: 'action',
      width: 130,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          <Popconfirm
            title={`ユーザー [${record.userName}] を削除しますか？`}
            onConfirm={() => handleDelete(record.userCd)}
            okText="削除"
            cancelText="キャンセル"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      {/* Search Header */}
      <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={10}>
            <Space align="center">
              <UserOutlined className="erp-banner-icon" style={{ color: '#1890ff' }} />
              <div>
                <Title level={4} className="erp-page-title">
                  ユーザーマスタ保守 (AD1730C)
                </Title>
                <Text type="secondary" className="erp-page-desc">
                  社員アカウント・ログイン権限・所属部門の管理
                </Text>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={14} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Input
                className="erp-filter-input"
                placeholder="社員CD / 氏名 / フリガナ"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={fetchUsers}
                allowClear
              />
              <Select
                className="erp-filter-select"
                placeholder="グループ権限"
                style={{ width: 140 }}
                allowClear
                value={selectedGrp}
                onChange={(v) => setSelectedGrp(v)}
                options={[
                  { value: '1', label: '一般グループ' },
                  { value: '9', label: '管理者グループ' },
                ]}
              />
              <Button type="primary" className="erp-banner-btn" icon={<SearchOutlined />} onClick={fetchUsers}>
                検索<span className="erp-btn-shortcut"> (F5)</span>
              </Button>
              <Button className="erp-banner-btn" icon={<ReloadOutlined />} onClick={fetchUsers}>
                再読込
              </Button>
              <Button
                type="primary"
                className="erp-banner-btn"
                icon={<PlusOutlined />}
                onClick={handleOpenCreate}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                新規登録<span className="erp-btn-shortcut"> (F1)</span>
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          rowKey="userCd"
          pagination={{
            current: page,
            pageSize: 20,
            total: totalCount,
            onChange: (p) => setPage(p),
            showTotal: (total) => `全 ${total} 名`,
          }}
          bordered
          size="middle"
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* User Create/Edit Modal */}
      <Modal
        title={editingItem ? `ユーザー編集 [${editingItem.userCd}]` : '新規ユーザー登録 (F1)'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        width={640}
        style={{ maxWidth: '92vw' }}
        okText="保存"
        cancelText="キャンセル"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="userCd"
                label="社員コード (6桁)"
                rules={[
                  { required: true, message: '社員コードを入力してください' },
                  { max: 6, message: '最大6桁です' },
                ]}
              >
                <Input placeholder="例: 000004" disabled={!!editingItem} maxLength={6} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="userName"
                label="氏名"
                rules={[{ required: true, message: '氏名を入力してください' }]}
              >
                <Input placeholder="例: 田中 一郎" maxLength={20} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="userNameK" label="フリガナ">
                <Input placeholder="例: タナカ イチロウ" maxLength={20} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="userNameR" label="略称">
                <Input placeholder="例: 田中" maxLength={10} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="syubetu" label="所属部門" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 1, label: '1: 営業部' },
                    { value: 5, label: '5: 工務部' },
                    { value: 9, label: '9: 経理部' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="userGrpCd" label="権限グループ" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: '1', label: '1: 一般ユーザー' },
                    { value: '9', label: '9: システム管理者' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="tantoKbn" label="担当者区分" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 1, label: '1: 担当者' },
                    { value: 9, label: '9: 担当者以外' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          {!editingItem ? (
            <Form.Item
              name="password"
              label="初期ログインパスワード"
              rules={[{ required: true, message: 'パスワードを入力してください' }]}
            >
              <Input.Password prefix={<KeyOutlined />} placeholder="初期パスワード" />
            </Form.Item>
          ) : (
            <Form.Item
              name="newPassword"
              label="パスワード再設定 (変更する場合のみ入力)"
            >
              <Input.Password prefix={<KeyOutlined />} placeholder="新しいパスワード" />
            </Form.Item>
          )}

          <Form.Item name="biko" label="備考">
            <Input.TextArea rows={2} placeholder="役職、内線番号等" maxLength={40} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};
