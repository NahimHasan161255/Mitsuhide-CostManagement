import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Button, Space, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiClient } from '../../api/client';
import type { Kojijyu } from '../../types/cost';
import type { PagedResult } from '../../types/master';

interface ProjectSelectModalProps {
  open: boolean;
  onCancel: () => void;
  onSelect: (project: Kojijyu) => void;
}

export const ProjectSelectModal: React.FC<ProjectSelectModalProps> = ({ open, onCancel, onSelect }) => {
  const [data, setData] = useState<Kojijyu[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<PagedResult<Kojijyu>>('/kojijyu', {
        params: { page, pageSize: 10, keyword },
      });
      setData(res.data.items);
      setTotal(res.data.totalCount);
    } catch {
      // Mock data fallback
      const mock: Kojijyu[] = [
        {
          kojiCd: 100001,
          kojiSyu: 1,
          kojiNm: '名駅再開発ビル新築工事（鉄骨工事）',
          kojiRyk: '名駅再開発',
          jyuCd: 1001,
          jyuNm: '大林組 名古屋支店',
          keiyakuGnk: 120000000,
          keiyakuGkm: 132000000,
          keiyaku0Dt: 20260401,
          keiyaku0Rt: 10,
          keiyaku0Nk: 120000000,
          keiyaku0Km: 132000000,
          yosangaku: 96000000,
          yoteiArari: 24000000,
          yoteiArariRate: 20.0,
          koukiBgn: 20260401,
          koukiEnd: 20261231,
          jyuryo: 450,
          koumin: 2,
          keitai: 1,
          kanseiKb: 0,
          horyuFg: 0,
        },
        {
          kojiCd: 100002,
          kojiSyu: 1,
          kojiNm: '栄オフィスタワー耐震補強工事',
          kojiRyk: '栄タワー補強',
          jyuCd: 1002,
          jyuNm: '清水建設 中部支店',
          keiyakuGnk: 45000000,
          keiyakuGkm: 49500000,
          keiyaku0Dt: 20260510,
          keiyaku0Rt: 10,
          keiyaku0Nk: 45000000,
          keiyaku0Km: 49500000,
          yosangaku: 35000000,
          yoteiArari: 10000000,
          yoteiArariRate: 22.2,
          koukiBgn: 20260515,
          koukiEnd: 20261031,
          jyuryo: 120,
          koumin: 2,
          keitai: 1,
          kanseiKb: 0,
          horyuFg: 0,
        },
      ];
      setData(mock.filter(x => !keyword || (x.kojiNm && x.kojiNm.includes(keyword)) || String(x.kojiCd).includes(keyword)));
      setTotal(mock.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open, page]);

  const columns: ColumnsType<Kojijyu> = [
    {
      title: '工事コード',
      width: 110,
      render: (_, r) => <Tag color="geekblue">{`${r.kojiCd}-${r.kojiSyu}`}</Tag>,
    },
    {
      title: '工事名称',
      dataIndex: 'kojiNm',
      ellipsis: true,
      render: (t, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{t}</div>
          <small style={{ color: '#888' }}>{r.jyuNm}</small>
        </div>
      ),
    },
    {
      title: '契約額(税抜)',
      dataIndex: 'keiyakuGnk',
      width: 130,
      align: 'right',
      render: (v) => `¥${(v || 0).toLocaleString()}`,
    },
    {
      title: '工期',
      width: 140,
      render: (_, r) => (
        <span style={{ fontSize: 11 }}>
          {r.koukiBgn} ~ {r.koukiEnd}
        </span>
      ),
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
      title="工事コード検索 (frm_sel_kojijyu)"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={780}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space>
          <Input
            placeholder="工事コード・工事名・受注先で検索"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => {
              setPage(1);
              fetchProjects();
            }}
            style={{ width: 340 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => {
              setPage(1);
              fetchProjects();
            }}
          >
            検索
          </Button>
        </Space>

        <Table
          rowKey={(r) => `${r.kojiCd}-${r.kojiSyu}`}
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
