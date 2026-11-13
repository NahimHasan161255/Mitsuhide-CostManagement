import React, { useState } from 'react';
import { ConfigProvider, Card, Row, Col, Statistic, Button, Space, Typography, Alert } from 'antd';
import jaJP from 'antd/locale/ja_JP';
import {
  ProjectOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  ArrowRightOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { MainLayout } from './components/Layout/MainLayout';
import { JyucyuMasterPage } from './pages/Master/JyucyuMasterPage';

const { Paragraph } = Typography;

export const App: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');

  const renderContent = () => {
    switch (activeMenu) {
      case 'ad1780c':
        return <JyucyuMasterPage />;

      case 'dashboard':
      default:
        return (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Alert
              message="システム稼働状況"
              description="株式会社ミツヒデ 原価管理システム（Web版）の初期基盤が正常にセットアップされました。左側メニューから各業務モジュールを選択できます。"
              type="info"
              showIcon
              closable
            />

            {/* KPI Summary Cards */}
            <Row gutter={16}>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="当期 契約額合計 (受注)"
                    value={184500000}
                    precision={0}
                    prefix="¥"
                    valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                  />
                  <small style={{ color: '#888' }}>前年同期比 +12.5%</small>
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="当期 予算総額"
                    value={142000000}
                    precision={0}
                    prefix="¥"
                    valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                  />
                  <small style={{ color: '#888' }}>予算消化率 76.9%</small>
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="当月 仕入実績 (原価発生)"
                    value={18250000}
                    precision={0}
                    prefix="¥"
                    valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
                  />
                  <small style={{ color: '#888' }}>未処理伝票: 0件</small>
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="当月 予想粗利率"
                    value={23.0}
                    precision={1}
                    suffix="%"
                    prefix={<RiseOutlined />}
                    valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
                  />
                  <small style={{ color: '#888' }}>目標粗利率 20.0% 達成</small>
                </Card>
              </Col>
            </Row>

            {/* Quick Actions */}
            <Row gutter={16}>
              <Col span={16}>
                <Card title="クイック業務アクション" bordered={false}>
                  <Paragraph type="secondary">よく使用する業務画面へワンクリックでアクセスできます。</Paragraph>
                  <Space wrap size="middle">
                    <Button
                      type="primary"
                      icon={<ProjectOutlined />}
                      size="large"
                      onClick={() => setActiveMenu('gk0010')}
                    >
                      工事受注入力 (GK0010)
                    </Button>
                    <Button
                      icon={<DollarOutlined />}
                      size="large"
                      onClick={() => setActiveMenu('ur0010')}
                    >
                      工事種目売上入力 (UR0010)
                    </Button>
                    <Button
                      icon={<ShoppingCartOutlined />}
                      size="large"
                      onClick={() => setActiveMenu('sr0010')}
                    >
                      仕入入力 (SR0010)
                    </Button>
                    <Button
                      icon={<SettingOutlined />}
                      size="large"
                      onClick={() => setActiveMenu('ad1780c')}
                    >
                      受注先マスタ保守 (AD1780C)
                    </Button>
                  </Space>
                </Card>
              </Col>

              <Col span={8}>
                <Card title="月次更新・締日ステータス" bordered={false}>
                  <Paragraph>
                    <strong>現在処理基準年月:</strong> 2026年11月
                  </Paragraph>
                  <Paragraph>
                    <strong>次回締日:</strong> 11月20日 (あと7日)
                  </Paragraph>
                  <Button type="link" onClick={() => setActiveMenu('vm0010')} style={{ paddingLeft: 0 }}>
                    月次更新処理画面へ進む <ArrowRightOutlined />
                  </Button>
                </Card>
              </Col>
            </Row>
          </Space>
        );
    }
  };

  return (
    <ConfigProvider
      locale={jaJP}
      theme={{
        token: {
          colorPrimary: '#172b3a', // Navy tone matching Mitsuhide ERP
          borderRadius: 6,
          fontFamily: '"Yu Gothic UI", "Meiryo", "Noto Sans JP", sans-serif',
        },
      }}
    >
      <MainLayout activeMenu={activeMenu} onSelectMenu={setActiveMenu}>
        {renderContent()}
      </MainLayout>
    </ConfigProvider>
  );
};

export default App;
