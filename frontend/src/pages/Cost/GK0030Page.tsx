import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Button,
  Space,
  Tag,
  Descriptions,
  Tabs,
  Input,
  message,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  PrinterOutlined,
  ReloadOutlined,
  DollarOutlined,
  PieChartOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ProjectSelectModal } from '../../components/Modals/ProjectSelectModal';

const { Title, Text } = Typography;

interface LedgerBudgetLine {
  yosaSyu: number;
  yosaSyuNm: string;
  siireNm?: string;
  yosanGk: number;
  actualCost: number;
  variance: number;
}

interface LedgerSiireLine {
  siireDate: number;
  siireNm?: string;
  yosaSyu: number;
  siireGkNk: number;
  biko?: string;
}

interface ProjectLedgerData {
  kojiCd: number;
  kojiSyu: number;
  kojiNm: string;
  kojiRyk?: string;
  jyuNm?: string;
  koukiBgn: number;
  koukiEnd: number;
  kanseiKb: number;
  keiyakuGnk: number;
  keiyakuGkm: number;
  yosangaku: number;
  actualSiireGk: number;
  actualUriageGk: number;
  plannedMargin: number;
  plannedMarginRate: number;
  actualMargin: number;
  actualMarginRate: number;
  remainingBudget: number;
  budgetExecutionRate: number;
  budgetLines: LedgerBudgetLine[];
  recentPurchases: LedgerSiireLine[];
}

export const GK0030Page: React.FC = () => {
  const [kojiCd, setKojiCd] = useState<number>(1001);
  const [kojiSyu, setKojiSyu] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [ledger, setLedger] = useState<ProjectLedgerData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Japanese Date helper (YYYYMMDD -> YYYY/MM/DD)
  const formatDate = (val?: number) => {
    if (!val || val.toString().length !== 8) return '-';
    const s = val.toString();
    return `${s.substring(0, 4)}/${s.substring(4, 6)}/${s.substring(6, 8)}`;
  };

  const fetchLedger = async (targetCd: number, targetSyu: number) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5247/api/ledger/${targetCd}/${targetSyu}`);
      if (res.ok) {
        const data = await res.json();
        setLedger(data);
      } else {
        // Mock fallback if backend has no data yet
        setLedger({
          kojiCd: targetCd,
          kojiSyu: targetSyu,
          kojiNm: '新社屋新築工事 (鉄骨工事一式)',
          kojiRyk: '新社屋新築',
          jyuNm: '清水建設 株式会社',
          koukiBgn: 20260401,
          koukiEnd: 20261130,
          kanseiKb: 0,
          keiyakuGnk: 45000000,
          keiyakuGkm: 49500000,
          yosangaku: 35200000,
          actualSiireGk: 24650000,
          actualUriageGk: 30000000,
          plannedMargin: 9800000,
          plannedMarginRate: 21.8,
          actualMargin: 5350000,
          actualMarginRate: 17.8,
          remainingBudget: 10550000,
          budgetExecutionRate: 70.0,
          budgetLines: [
            { yosaSyu: 101, yosaSyuNm: '鋼材・材料費', siireNm: '阪和興業 株式会社', yosanGk: 16500000, actualCost: 12400000, variance: 4100000 },
            { yosaSyu: 102, yosaSyuNm: '一次加工・切断', siireNm: 'ミツヒデ 第一工場', yosanGk: 4200000, actualCost: 3100000, variance: 1100000 },
            { yosaSyu: 103, yosaSyuNm: '二次加工・鍛冶組立', siireNm: 'ミツヒデ 第二工場', yosanGk: 5800000, actualCost: 4200000, variance: 1600000 },
            { yosaSyu: 104, yosaSyuNm: '溶接・検査費', siireNm: '日本非破壊検査 株式会社', yosanGk: 2500000, actualCost: 1850000, variance: 650000 },
            { yosaSyu: 105, yosaSyuNm: 'メッキ・塗装費', siireNm: '朝日防錆塗装 工業', yosanGk: 2800000, actualCost: 1600000, variance: 1200000 },
            { yosaSyu: 106, yosaSyuNm: '運搬・トレーラー費', siireNm: '丸全昭和運輸 株式会社', yosanGk: 1400000, actualCost: 950000, variance: 450000 },
            { yosaSyu: 107, yosaSyuNm: '現場建方・クレーン費', siireNm: '東京重機 株式会社', yosanGk: 2000000, actualCost: 550000, variance: 1450000 },
          ],
          recentPurchases: [
            { siireDate: 20261015, siireNm: '阪和興業 株式会社', yosaSyu: 101, siireGkNk: 3200000, biko: 'H形鋼 SM490A 納品第3便' },
            { siireDate: 20261010, siireNm: '日本非破壊検査 株式会社', yosaSyu: 104, siireGkNk: 650000, biko: '超音波探傷試験(UT) 柱梁接合部' },
            { siireDate: 20260928, siireNm: '朝日防錆塗装 工業', yosaSyu: 105, siireGkNk: 1600000, biko: '耐火下地塗装 一式' },
            { siireDate: 20260915, siireNm: '丸全昭和運輸 株式会社', yosaSyu: 106, siireGkNk: 450000, biko: '大型低床トレーラー 2台分' },
          ],
        });
      }
    } catch {
      message.info('バックエンド接続確認中。デモ用台帳データを表示します。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger(kojiCd, kojiSyu);
  }, []);

  const handleSelectProject = (project: { kojiCd: number; kojiSyu: number }) => {
    setKojiCd(project.kojiCd);
    setKojiSyu(project.kojiSyu);
    setIsModalOpen(false);
    fetchLedger(project.kojiCd, project.kojiSyu);
  };

  // Columns for Budget Lines table
  const budgetColumns: ColumnsType<LedgerBudgetLine> = [
    {
      title: '予算種目',
      dataIndex: 'yosaSyuNm',
      key: 'yosaSyuNm',
      width: 180,
      render: (val, record) => (
        <span>
          <Tag color="blue">{record.yosaSyu}</Tag> {val}
        </span>
      ),
    },
    {
      title: '指定外注 / 仕入先',
      dataIndex: 'siireNm',
      key: 'siireNm',
      render: (val) => val || <Text type="secondary">-</Text>,
    },
    {
      title: '実行予算額 (円)',
      dataIndex: 'yosanGk',
      key: 'yosanGk',
      align: 'right',
      render: (val) => <Text strong>¥{val.toLocaleString()}</Text>,
    },
    {
      title: '発生原価実績 (円)',
      dataIndex: 'actualCost',
      key: 'actualCost',
      align: 'right',
      render: (val) => <Text style={{ color: '#fa8c16' }}>¥{val.toLocaleString()}</Text>,
    },
    {
      title: '予算残高 / 差額 (円)',
      dataIndex: 'variance',
      key: 'variance',
      align: 'right',
      render: (val) => (
        <Text style={{ color: val >= 0 ? '#52c41a' : '#f5222d', fontWeight: 600 }}>
          ¥{val.toLocaleString()}
        </Text>
      ),
    },
    {
      title: '消化率',
      key: 'rate',
      width: 140,
      render: (_, r) => {
        const rate = r.yosanGk > 0 ? Math.round((r.actualCost / r.yosanGk) * 100) : 0;
        return (
          <Progress
            percent={rate}
            size="small"
            status={rate > 100 ? 'exception' : rate > 85 ? 'active' : 'normal'}
          />
        );
      },
    },
  ];

  // Columns for Recent Purchases table
  const purchaseColumns: ColumnsType<LedgerSiireLine> = [
    {
      title: '仕入発生日',
      dataIndex: 'siireDate',
      key: 'siireDate',
      width: 120,
      render: (val) => formatDate(val),
    },
    {
      title: '仕入先名',
      dataIndex: 'siireNm',
      key: 'siireNm',
      render: (val) => <Text strong>{val}</Text>,
    },
    {
      title: '種目コード',
      dataIndex: 'yosaSyu',
      key: 'yosaSyu',
      width: 100,
      render: (val) => <Tag>{val}</Tag>,
    },
    {
      title: '仕入金額(税抜)',
      dataIndex: 'siireGkNk',
      key: 'siireGkNk',
      align: 'right',
      render: (val) => <Text style={{ color: '#d46b08', fontWeight: 600 }}>¥{val.toLocaleString()}</Text>,
    },
    {
      title: '摘要 / 備考',
      dataIndex: 'biko',
      key: 'biko',
    },
  ];

  return (
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      {/* Top Search & Actions Bar */}
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Space align="center" wrap>
              <Title level={4} style={{ margin: 0, color: '#172b3a' }}>
                工事台帳照会 (GK0030)
              </Title>
              <Tag color="cyan">原価リアルタイム集計</Tag>
            </Space>
          </Col>

          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Input.Group compact>
                <Input
                  style={{ width: 120 }}
                  placeholder="工事コード"
                  value={kojiCd}
                  onChange={(e) => setKojiCd(Number(e.target.value) || 0)}
                />
                <Input
                  style={{ width: 60 }}
                  placeholder="種目"
                  value={kojiSyu}
                  onChange={(e) => setKojiSyu(Number(e.target.value) || 0)}
                />
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => fetchLedger(kojiCd, kojiSyu)}
                >
                  照会
                </Button>
              </Input.Group>

              <Button icon={<SearchOutlined />} onClick={() => setIsModalOpen(true)}>
                工事検索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => fetchLedger(kojiCd, kojiSyu)}>
                再計算
              </Button>
              <Button type="dashed" icon={<PrinterOutlined />}>
                台帳印刷 (PDF)
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Project Basic Overview */}
      {ledger && (
        <>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Descriptions
              title={
                <Space>
                  <FileTextOutlined style={{ color: '#1890ff' }} />
                  <span style={{ fontSize: 16, fontWeight: 700 }}>
                    {ledger.kojiNm} ({ledger.kojiCd}-{ledger.kojiSyu})
                  </span>
                  {ledger.kanseiKb === 1 ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                      完工済
                    </Tag>
                  ) : (
                    <Tag icon={<ClockCircleOutlined />} color="processing">
                      仕掛中 (施工進行中)
                    </Tag>
                  )}
                </Space>
              }
              bordered
              size="small"
              column={{ xs: 1, sm: 2, md: 4 }}
            >
              <Descriptions.Item label="発注元 (受注先)">{ledger.jyuNm || '未設定'}</Descriptions.Item>
              <Descriptions.Item label="工事略称">{ledger.kojiRyk || '-'}</Descriptions.Item>
              <Descriptions.Item label="着工日">{formatDate(ledger.koukiBgn)}</Descriptions.Item>
              <Descriptions.Item label="完成予定日">{formatDate(ledger.koukiEnd)}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 4 Financial Highlight KPI Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                <Statistic
                  title="契約額 (税抜受注額)"
                  value={ledger.keiyakuGnk}
                  precision={0}
                  prefix="¥"
                  valueStyle={{ color: '#237804', fontWeight: 700 }}
                />
                <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
                  税込: ¥{ledger.keiyakuGkm.toLocaleString()}
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}>
                <Statistic
                  title="実行予算額 (予定原価)"
                  value={ledger.yosangaku}
                  precision={0}
                  prefix="¥"
                  valueStyle={{ color: '#096dd9', fontWeight: 700 }}
                />
                <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
                  予定粗利率: <Text strong>{ledger.plannedMarginRate}%</Text> (¥{ledger.plannedMargin.toLocaleString()})
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ background: '#fff7e6', border: '1px solid #ffd591' }}>
                <Statistic
                  title="発生原価実績 (仕入累計)"
                  value={ledger.actualSiireGk}
                  precision={0}
                  prefix="¥"
                  valueStyle={{ color: '#d46b08', fontWeight: 700 }}
                />
                <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
                  予算残高: <Text strong style={{ color: ledger.remainingBudget >= 0 ? '#52c41a' : '#f5222d' }}>
                    ¥{ledger.remainingBudget.toLocaleString()}
                  </Text>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ background: '#f9f0ff', border: '1px solid #d3adf7' }}>
                <Statistic
                  title="累計請求売上 / 実績粗利"
                  value={ledger.actualMargin}
                  precision={0}
                  prefix="¥"
                  valueStyle={{ color: '#722ed1', fontWeight: 700 }}
                />
                <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
                  実績粗利率: <Text strong>{ledger.actualMarginRate}%</Text> (売上: ¥{ledger.actualUriageGk.toLocaleString()})
                </div>
              </Card>
            </Col>
          </Row>

          {/* Budget Execution Progress */}
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Row align="middle" gutter={24}>
              <Col xs={24} md={6}>
                <Text strong style={{ fontSize: 15 }}>
                  実行予算 消化ステータス
                </Text>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                  原価消化率: {ledger.budgetExecutionRate}%
                </div>
              </Col>
              <Col xs={24} md={18}>
                <Progress
                  percent={ledger.budgetExecutionRate}
                  status={ledger.budgetExecutionRate > 100 ? 'exception' : 'active'}
                  strokeColor={{
                    from: '#108ee9',
                    to: ledger.budgetExecutionRate > 90 ? '#fa8c16' : '#87d068',
                  }}
                  strokeWidth={14}
                />
              </Col>
            </Row>
          </Card>

          {/* Detailed Ledger Tabs */}
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Tabs
              defaultActiveKey="budget"
              items={[
                {
                  key: 'budget',
                  label: (
                    <span>
                      <PieChartOutlined /> 予算種目別対比明細
                    </span>
                  ),
                  children: (
                    <Table
                      loading={loading}
                      dataSource={ledger.budgetLines}
                      columns={budgetColumns}
                      rowKey="yosaSyu"
                      pagination={false}
                      bordered
                      size="middle"
                      summary={(pageData) => {
                        let totalBudget = 0;
                        let totalActual = 0;
                        let totalVariance = 0;
                        pageData.forEach(({ yosanGk, actualCost, variance }) => {
                          totalBudget += yosanGk;
                          totalActual += actualCost;
                          totalVariance += variance;
                        });
                        return (
                          <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 'bold' }}>
                            <Table.Summary.Cell index={0} colSpan={2}>
                              予算合計
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right">
                              ¥{totalBudget.toLocaleString()}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2} align="right">
                              <span style={{ color: '#fa8c16' }}>¥{totalActual.toLocaleString()}</span>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={3} align="right">
                              <span style={{ color: totalVariance >= 0 ? '#52c41a' : '#f5222d' }}>
                                ¥{totalVariance.toLocaleString()}
                              </span>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={4}>
                              {totalBudget > 0 ? `${Math.round((totalActual / totalBudget) * 100)}%` : '0%'}
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        );
                      }}
                    />
                  ),
                },
                {
                  key: 'purchases',
                  label: (
                    <span>
                      <DollarOutlined /> 発生仕入伝票一覧 (最新15件)
                    </span>
                  ),
                  children: (
                    <Table
                      dataSource={ledger.recentPurchases}
                      columns={purchaseColumns}
                      rowKey={(_, idx) => idx?.toString() || '0'}
                      pagination={false}
                      bordered
                      size="middle"
                    />
                  ),
                },
              ]}
            />
          </Card>
        </>
      )}

      {/* Project Search Modal */}
      <ProjectSelectModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSelect={handleSelectProject}
      />
    </Space>
  );
};
