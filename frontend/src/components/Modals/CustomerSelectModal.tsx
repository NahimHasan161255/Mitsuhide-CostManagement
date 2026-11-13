import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Button, Space, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiClient } from '../../api/client';
import type { Jyucyu, PagedResult } from '../../types/master';

interface CustomerSelectModalProps {
  open: boolean;
  onCancel: () => void;
  onSelect: (customer: Jyucyu) => void;
}

export const CustomerSelectModal: React.FC<CustomerSelectModalProps> = ({ open, onCancel, onSelect }) => {
  const [data, setData] = useState<Jyucyu[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<PagedResult<Jyucyu>>('/jyucyu', {
        params: { page, pageSize: 10, keyword },
      });
      setData(res.data.items);
      setTotal(res.data.totalCount);
    } catch {
      // Mock fallback
      const mock = [
        { code: 1001, name: '大林組 名古屋支店', ryaku: '大林組', kana: 'オオバヤシグミ', sekinin: '山田 太郎', tel: '052-123-4567', simeDd: 20, syukinMm: 1, syukinDd: 30, tegata: 50, genkin: 50, kakeRt: 100, syosiki: 1, toriKb: 1 },
        { code: 1002, name: '清水建設 中部支店', ryaku: '清水建設', kana: 'シミズケンセツ', sekinin: '鈴木 一郎', tel: '052-987-6543', simeDd: 25, syukinMm: 2, syukinDd: 10, tegata: 0, genkin: 100, kakeRt: 100, syosiki: 1, toriKb: 1 },
        { code: 1003, name: '鹿島建設 中部支社', ryaku: '鹿島建設', kana: 'カジマケンセツ', sekinin: '佐藤 次郎', tel: '052-555-8888', simeDd: 31, syukinMm: 1, syukinDd: 25, tegata: 30, genkin: 70, kakeRt: 100, syosiki: 1, toriKb: 1 },
      ];
      setData(mock.filter(x => !keyword || x.name.includes(keyword) || String(x.code).includes(keyword)));
      setTotal(mock.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
  }, [open, page]);

  const columns: ColumnsType<Jyucyu> = [
    {
      title: 'コード',
      dataIndex: 'code',
      width: 90,
      render: (c) => <Tag color="blue">{c}</Tag>,
    },
    {
      title: '受注先名称',
      dataIndex: 'name',
      render: (t, r) => (
        <div>
          <strong>{t}</strong>
          <div style={{ color: '#888', fontSize: 11 }}>{r.kana}</div>
        </div>
      ),
    },
    {
      title: '略称',
      dataIndex: 'ryaku',
      width: 110,
    },
    {
      title: '責任者',
      dataIndex: 'sekinin',
      width: 100,
    },
    {
      title: '操作',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            onSelect(record);
            onCancel();
          }}
        >
          選択
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title="受注先マスタ検索 (frm_sel_jyucyu)"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={680}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space>
          <Input
            placeholder="コード・名称・カナで検索"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => {
              setPage(1);
              fetchCustomers();
            }}
            style={{ width: 300 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => {
              setPage(1);
              fetchCustomers();
            }}
          >
            検索
          </Button>
        </Space>

        <Table
          rowKey="code"
          columns={columns}
          dataSource={data}
          loading={loading}
          size="small"
          pagination={{
            current: page,
            pageSize: 10,
            total,
            onChange: (p) => setPage(p),
            showTotal: (t) => `全 ${t} 件`,
          }}
          onRow={(record) => ({
            onDoubleClick: () => {
              onSelect(record);
              onCancel();
            },
          })}
        />
      </Space>
    </Modal>
  );
};
