import React, { useState, useEffect } from 'react';
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
  Modal,
  Form,
  message,
  Popconfirm,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { API_BASE_URL } from '../../api/client';

const { Title, Text } = Typography;

interface UserGrpItem {
  userGrpCd: string;
  userGrpName: string;
  runAplCnt: number;
}

export const UserGrpMasterPage: React.FC = () => {
  const [data, setData] = useState<UserGrpItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserGrpItem | null>(null);
  const [form] = Form.useForm();

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/usergrp`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        // Mock fallback
        setData([
          { userGrpCd: '1', userGrpName: '一般グループ', runAplCnt: 5 },
          { userGrpCd: '9', userGrpName: 'システム管理者グループ', runAplCnt: 10 },
        ]);
      }
    } catch {
      message.info('グループマスタ取得中 (デモデータ表示)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      if (editingItem) {
        form.setFieldsValue(editingItem);
      } else {
        form.resetFields();
        form.setFieldsValue({ runAplCnt: 5 });
      }
    }
  }, [isModalOpen, editingItem]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: UserGrpItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await fetch(`${API_BASE_URL}/api/usergrp/${editingItem.userGrpCd}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        message.success(`グループ [${editingItem.userGrpCd}] を更新しました。`);
      } else {
        await fetch(`${API_BASE_URL}/api/usergrp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        message.success(`新規グループ [${values.userGrpCd}] を登録しました。`);
      }
      setIsModalOpen(false);
      fetchGroups();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (grpCd: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/usergrp/${grpCd}`, { method: 'DELETE' });
      message.success(`グループ [${grpCd}] を削除しました。`);
      fetchGroups();
    } catch {
      message.error('削除に失敗しました。');
    }
  };

  const columns: ColumnsType<UserGrpItem> = [
    {
      title: 'グループCD',
      dataIndex: 'userGrpCd',
      key: 'userGrpCd',
      width: 140,
      render: (val) => <Tag color={val === '9' ? 'magenta' : 'blue'}>CD: {val}</Tag>,
    },
    {
      title: 'グループ名称',
      dataIndex: 'userGrpName',
      key: 'userGrpName',
      render: (val, r) => (
        <span>
          <Text strong>{val}</Text>
          {r.userGrpCd === '9' && <Tag color="gold" style={{ marginLeft: 8 }}>フル権限</Tag>}
        </span>
      ),
    },
    {
      title: '同時実行可能APL数',
      dataIndex: 'runAplCnt',
      key: 'runAplCnt',
      width: 160,
      align: 'right',
      render: (val) => `${val} 画面`,
    },
    {
      title: '操作',
      key: 'action',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          <Popconfirm
            title={`グループ [${record.userGrpName}] を削除しますか？`}
            onConfirm={() => handleDelete(record.userGrpCd)}
            okText="削除"
            cancelText="キャンセル"
          >
            <Button size="small" danger icon={<DeleteOutlined />} disabled={record.userGrpCd === '9'} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      {/* Header */}
      <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Space align="center">
              <TeamOutlined style={{ fontSize: 24, color: '#722ed1' }} />
              <div>
                <Title level={4} style={{ margin: 0, color: '#172b3a' }}>
                  ユーザーグループマスタ保守 (AD1720C)
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ユーザーグループコードおよび同時実行画面数の管理
                </Text>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={fetchGroups}>
                再読込
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate} style={{ background: '#52c41a' }}>
                新規グループ登録 (F1)
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
          rowKey="userGrpCd"
          pagination={false}
          bordered
          size="middle"
        />
      </Card>

      {/* Modal */}
      <Modal
        title={editingItem ? `グループ編集 [${editingItem.userGrpCd}]` : '新規グループ登録 (F1)'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        width={500}
        destroyOnHidden
        okText="保存"
        cancelText="キャンセル"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="userGrpCd"
            label="グループコード (最大4桁)"
            rules={[
              { required: true, message: 'グループコードを入力してください' },
              { max: 4, message: '最大4桁です' },
            ]}
          >
            <Input placeholder="例: 2" disabled={!!editingItem} maxLength={4} />
          </Form.Item>

          <Form.Item
            name="userGrpName"
            label="グループ名称"
            rules={[{ required: true, message: 'グループ名称を入力してください' }]}
          >
            <Input placeholder="例: 営業一般グループ" maxLength={20} />
          </Form.Item>

          <Form.Item
            name="runAplCnt"
            label="同時実行可能APL数"
            rules={[{ required: true, message: '同時実行可能数を入力してください' }]}
          >
            <InputNumber min={1} max={20} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};
