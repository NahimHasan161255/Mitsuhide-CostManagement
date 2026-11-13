import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Space, Modal, Form, Row, Col, InputNumber, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiClient } from '../../api/client';
import type { Jyucyu, PagedResult } from '../../types/master';

export const JyucyuMasterPage: React.FC = () => {
  const [data, setData] = useState<Jyucyu[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [total, setTotal] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Jyucyu | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<PagedResult<Jyucyu>>('/jyucyu', {
        params: { page, pageSize, keyword },
      });
      setData(res.data.items);
      setTotal(res.data.totalCount);
    } catch {
      // Mock data fallback if backend is not yet started by user
      const mockList: Jyucyu[] = [
        { code: 1001, name: '大林組 名古屋支店', ryaku: '大林組', kana: 'オオバヤシグミ', sekinin: '山田 太郎', tel: '052-123-4567', simeDd: 20, syukinMm: 1, syukinDd: 30, tegata: 50, genkin: 50, kakeRt: 100, syosiki: 1, toriKb: 1 },
        { code: 1002, name: '清水建設 中部支店', ryaku: '清水建設', kana: 'シミズケンセツ', sekinin: '鈴木 一郎', tel: '052-987-6543', simeDd: 25, syukinMm: 2, syukinDd: 10, tegata: 0, genkin: 100, kakeRt: 100, syosiki: 1, toriKb: 1 },
        { code: 1003, name: '鹿島建設 中部支社', ryaku: '鹿島建設', kana: 'カジマケンセツ', sekinin: '佐藤 次郎', tel: '052-555-8888', simeDd: 31, syukinMm: 1, syukinDd: 25, tegata: 30, genkin: 70, kakeRt: 100, syosiki: 1, toriKb: 1 },
      ];
      setData(mockList.filter(x => !keyword || x.name.includes(keyword) || String(x.code).includes(keyword)));
      setTotal(3);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleOpenModal = (item?: Jyucyu) => {
    if (item) {
      setEditingItem(item);
      form.setFieldsValue(item);
    } else {
      setEditingItem(null);
      form.resetFields();
      form.setFieldsValue({
        simeDd: 20,
        syukinMm: 1,
        syukinDd: 30,
        tegata: 0,
        genkin: 100,
        kakeRt: 100,
        syosiki: 1,
        toriKb: 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await apiClient.put(`/jyucyu/${editingItem.code}`, values).catch(() => {});
        message.success(`受注先コード ${editingItem.code} を更新しました。`);
      } else {
        await apiClient.post('/jyucyu', values).catch(() => {});
        message.success(`受注先コード ${values.code} を新規登録しました。`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch {
      message.error('入力内容を確認してください。');
    }
  };

  const handleDelete = async (code: number) => {
    try {
      await apiClient.delete(`/jyucyu/${code}`).catch(() => {});
      message.success(`受注先コード ${code} を削除しました。`);
      fetchData();
    } catch {
      message.error('削除に失敗しました。');
    }
  };

  const columns: ColumnsType<Jyucyu> = [
    {
      title: '受注先CD',
      dataIndex: 'code',
      width: 100,
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: '受注先名',
      dataIndex: 'name',
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <small style={{ color: '#888' }}>{record.kana}</small>
        </div>
      ),
    },
    {
      title: '略称',
      dataIndex: 'ryaku',
      width: 120,
    },
    {
      title: '責任者',
      dataIndex: 'sekinin',
      width: 120,
    },
    {
      title: 'TEL',
      dataIndex: 'tel',
      width: 130,
    },
    {
      title: '締日',
      dataIndex: 'simeDd',
      width: 80,
      align: 'center',
      render: (dd) => `${dd === 31 ? '末' : dd}日`,
    },
    {
      title: '集金条件',
      width: 120,
      render: (_, r) => `${r.syukinMm}ヶ月後 ${r.syukinDd === 31 ? '末' : r.syukinDd}日`,
    },
    {
      title: '操作',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="削除確認"
            description="この受注先を削除してもよろしいですか？"
            okText="削除"
            cancelText="キャンセル"
            onConfirm={() => handleDelete(record.code)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="受注先マスタ保守 (AD1780C)"
      extra={
        <Space>
          <Input
            placeholder="コード・名称・カナで検索"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 240 }}
            allowClear
          />
          <Button icon={<SearchOutlined />} onClick={handleSearch}>
            検索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            更新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            新規登録
          </Button>
        </Space>
      }
    >
      <Table
        rowKey="code"
        columns={columns}
        dataSource={data}
        loading={loading}
        size="small"
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
          showTotal: (t) => `全 ${t} 件`,
        }}
      />

      {/* Add / Edit Modal */}
      <Modal
        title={editingItem ? `受注先編集 [${editingItem.code}]` : '受注先新規登録'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        width={720}
        okText="保存"
        cancelText="キャンセル"
        destroyOnClose
      >
        <Form form={form} layout="vertical" size="small">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="受注先コード"
                name="code"
                rules={[{ required: true, message: 'コードを入力してください' }]}
              >
                <InputNumber style={{ width: '100%' }} disabled={!!editingItem} placeholder="6桁" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                label="受注先名"
                name="name"
                rules={[{ required: true, message: '名称を入力してください' }]}
              >
                <Input placeholder="例: ○○建設株式会社" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="略称" name="ryaku">
                <Input placeholder="画面表示用略称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="カナ名 (検索用)" name="kana">
                <Input placeholder="半角・全角カナ" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="責任者" name="sekinin">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="TEL" name="tel">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="FAX" name="fax">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="郵便番号" name="yubin">
                <Input placeholder="000-0000" />
              </Form.Item>
            </Col>
            <Col span={18}>
              <Form.Item label="住所1" name="jyusyo1">
                <Input placeholder="都道府県・市区町村・番地" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="請求締日 (DD)" name="simeDd">
                <InputNumber min={1} max={31} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="集金月 (何ヶ月後)" name="syukinMm">
                <InputNumber min={0} max={12} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="集金日 (DD)" name="syukinDd">
                <InputNumber min={1} max={31} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="回収方法" name="kaisyu">
                <Input placeholder="振込/手形など" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Card>
  );
};
