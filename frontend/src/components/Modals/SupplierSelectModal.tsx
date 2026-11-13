import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Button, Space, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiClient } from '../../api/client';
import type { Siire, PagedResult } from '../../types/master';

interface SupplierSelectModalProps {
  open: boolean;
  onCancel: () => void;
  onSelect: (supplier: Siire) => void;
}

export const SupplierSelectModal: React.FC<SupplierSelectModalProps> = ({ open, onCancel, onSelect }) => {
  const [data, setData] = useState<Siire[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<PagedResult<Siire>>('/siire', {
        params: { page, pageSize: 10, keyword },
      });
      setData(res.data.items);
      setTotal(res.data.totalCount);
    } catch {
      // Mock fallback
      const mock: Siire[] = [
        { code: 2001, name: '新日鉄住金鋼材（株）', ryaku: '新日鉄鋼材', kana: 'シンニッテツ', gyousyu: '鋼材仕入', sekinin: '加藤 健', tel: '052-777-1111', simeDd: 20, siharai: '翌月末振込', risoku: 0, kozaSb: 1 },
        { code: 2002, name: '中部亜鉛鍍金（株）', ryaku: '中部メッキ', kana: 'チュウブメッキ', gyousyu: 'メッキ加工', sekinin: '小林 誠', tel: '052-888-2222', simeDd: 25, siharai: '手形60日', risoku: 0, kozaSb: 1 },
        { code: 2003, name: '丸和運輸（株） 名古屋支店', ryaku: '丸和運輸', kana: 'マルワウンユ', gyousyu: '重量物運搬', sekinin: '野村 徹', tel: '052-999-3333', simeDd: 31, siharai: '翌月末振込', risoku: 0, kozaSb: 1 },
        { code: 2004, name: '三井物産スチール（株）', ryaku: '三井スチール', kana: 'ミツイスチール', gyousyu: 'H鋼・厚板', sekinin: '渡辺 浩', tel: '052-333-4444', simeDd: 20, siharai: '翌月末振込', risoku: 0, kozaSb: 1 },
      ];
      setData(mock.filter(x => !keyword || x.name.includes(keyword) || String(x.code).includes(keyword) || (x.gyousyu && x.gyousyu.includes(keyword))));
      setTotal(mock.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSuppliers();
    }
  }, [open, page]);

  const columns: ColumnsType<Siire> = [
    {
      title: '仕入先CD',
      dataIndex: 'code',
      width: 90,
      render: (c) => <Tag color="orange">{c}</Tag>,
    },
    {
      title: '仕入先名',
      dataIndex: 'name',
      render: (t, r) => (
        <div>
          <strong>{t}</strong>
          <div style={{ color: '#888', fontSize: 11 }}>{r.kana}</div>
        </div>
      ),
    },
    {
      title: '業種',
      dataIndex: 'gyousyu',
      width: 120,
      render: (g) => g ? <Tag>{g}</Tag> : '-',
    },
    {
      title: '責任者',
      dataIndex: 'sekinin',
      width: 100,
    },
    {
      title: '支払締日',
      dataIndex: 'simeDd',
      width: 90,
      align: 'center',
      render: (d) => `${d === 31 ? '末' : d}日`,
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
      title="仕入先マスタ検索 (frm_sel_siire)"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={720}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space>
          <Input
            placeholder="仕入先コード・名称・業種で検索"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => {
              setPage(1);
              fetchSuppliers();
            }}
            style={{ width: 320 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => {
              setPage(1);
              fetchSuppliers();
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
