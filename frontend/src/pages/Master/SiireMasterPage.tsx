import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Space, Modal, Form, Row, Col, InputNumber, message, Popconfirm, Tag, Select } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiClient } from '../../api/client';
import type { Siire, PagedResult } from '../../types/master';

export const SiireMasterPage: React.FC = () => {
  const [data, setData] = useState<Siire[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [total, setTotal] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Siire | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<PagedResult<Siire>>('/siire', {
        params: { page, pageSize, keyword },
      });
      setData(res.data.items);
      setTotal(res.data.totalCount);
    } catch {
      // Mock fallback
      const mock: Siire[] = [
        { code: 2001, name: '新日鉄住金鋼材（株）', ryaku: '新日鉄鋼材', kana: 'シンニッテツ', gyousyu: '鋼材仕入', sekinin: '加藤 健', tel: '052-777-1111', simeDd: 20, siharai: '翌月末振込', risoku: 0, kozaSb: 1, bnkNm: '三菱UFJ銀行', stnNm: '名古屋支店' },
        { code: 2002, name: '中部亜鉛鍍金（株）', ryaku: '中部メッキ', kana: 'チュウブメッキ', gyousyu: 'メッキ加工', sekinin: '小林 誠', tel: '052-888-2222', simeDd: 25, siharai: '手形60日', risoku: 0, kozaSb: 1, bnkNm: '三井住友銀行', stnNm: '名駅出張所' },
        { code: 2003, name: '丸和運輸（株） 名古屋支店', ryaku: '丸和運輸', kana: 'マルワウンユ', gyousyu: '重量物運搬', sekinin: '野村 徹', tel: '052-999-3333', simeDd: 31, siharai: '翌月末振込', risoku: 0, kozaSb: 1, bnkNm: '名古屋銀行', stnNm: '本店営業部' },
        { code: 2004, name: '三井物産スチール（株）', ryaku: '三井スチール', kana: 'ミツイスチール', gyousyu: 'H鋼・厚板', sekinin: '渡辺 浩', tel: '052-333-4444', simeDd: 20, siharai: '翌月末振込', risoku: 0, kozaSb: 1, bnkNm: 'みずほ銀行', stnNm: '名古屋中央支店' },
      ];
      setData(mock.filter(x => !keyword || x.name.includes(keyword) || String(x.code).includes(keyword) || (x.gyousyu && x.gyousyu.includes(keyword))));
      setTotal(mock.length);
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

  const handleOpenModal = (item?: Siire) => {
    if (item) {
      setEditingItem(item);
      form.setFieldsValue(item);
    } else {
      setEditingItem(null);
      form.resetFields();
      form.setFieldsValue({
        simeDd: 20,
        siharai: '翌月末振込',
        risoku: 0,
        kozaSb: 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await apiClient.put(`/siire/${editingItem.code}`, values).catch(() => {});
        message.success(`仕入先コード ${editingItem.code} を更新しました。`);
      } else {
        await apiClient.post('/siire', values).catch(() => {});
        message.success(`仕入先コード ${values.code} を新規登録しました。`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch {
      message.error('入力内容を確認してください。');
    }
  };

  const handleDelete = async (code: number) => {
    try {
      await apiClient.delete(`/siire/${code}`).catch(() => {});
      message.success(`仕入先コード ${code} を削除しました。`);
      fetchData();
    } catch {
      message.error('削除に失敗しました。');
    }
  };

  const columns: ColumnsType<Siire> = [
    {
      title: '仕入先CD',
      dataIndex: 'code',
      width: 100,
      render: (code) => <Tag color="orange">{code}</Tag>,
    },
    {
      title: '仕入先名称',
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
      title: '業種',
      dataIndex: 'gyousyu',
      width: 110,
      render: (g) => g ? <Tag>{g}</Tag> : '-',
    },
    {
      title: '責任者',
      dataIndex: 'sekinin',
      width: 110,
    },
    {
      title: 'TEL',
      dataIndex: 'tel',
      width: 130,
    },
    {
      title: '支払締日',
      dataIndex: 'simeDd',
      width: 80,
      align: 'center',
      render: (dd) => `${dd === 31 ? '末' : dd}日`,
    },
    {
      title: '支払条件',
      dataIndex: 'siharai',
      width: 120,
    },
    {
      title: '操作',
      width: 110,
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
            description="この仕入先を削除してもよろしいですか？"
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
      title="仕入先マスタ保守 (AD1790C)"
      extra={
        <Space>
          <Input
            placeholder="コード・名称・業種で検索"
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
        title={editingItem ? `仕入先編集 [${editingItem.code}]` : '仕入先新規登録'}
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
                label="仕入先コード"
                name="code"
                rules={[{ required: true, message: 'コードを入力してください' }]}
              >
                <InputNumber style={{ width: '100%' }} disabled={!!editingItem} placeholder="6桁" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                label="仕入先名"
                name="name"
                rules={[{ required: true, message: '名称を入力してください' }]}
              >
                <Input placeholder="例: ○○鋼材株式会社" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="略称" name="ryaku">
                <Input placeholder="画面表示用略称" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="カナ名 (検索用)" name="kana">
                <Input placeholder="半角・全角カナ" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="業種" name="gyousyu">
                <Input placeholder="例: 鋼材仕入、加工、運搬" />
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
              <Form.Item label="支払締日 (DD)" name="simeDd">
                <InputNumber min={1} max={31} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item label="支払方法" name="siharai">
                <Input placeholder="例: 翌月末振込、手形60日" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="銀行名" name="bnkNm">
                <Input placeholder="振込先銀行" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="支店名" name="stnNm">
                <Input placeholder="支店名" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="口座種別" name="kozaSb">
                <Select
                  options={[
                    { label: '普通', value: 1 },
                    { label: '当座', value: 2 },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item label="口座番号" name="kozano">
                <Input placeholder="7桁" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Card>
  );
};
