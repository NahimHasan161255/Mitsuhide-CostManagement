import React, { useState } from 'react';
import { ConfigProvider, App as AntdApp, Card, Row, Col, Statistic, Button, Space, Typography, Alert, Tag } from 'antd';
import jaJP from 'antd/locale/ja_JP';
import {
  TeamOutlined,
  ShopOutlined,
  SolutionOutlined,
  TagsOutlined,
  ControlOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { MainLayout } from './components/Layout/MainLayout';
import { JyucyuMasterPage } from './pages/Master/JyucyuMasterPage';
import { SiireMasterPage } from './pages/Master/SiireMasterPage';
import { UserMasterPage } from './pages/Master/UserMasterPage';
import { UserGrpMasterPage } from './pages/Master/UserGrpMasterPage';
import { SysNameMasterPage } from './pages/Master/SysNameMasterPage';
import { ControlMasterPage } from './pages/Master/ControlMasterPage';

// Other modules (Available for next releases)
import { GK0010Page } from './pages/Cost/GK0010Page';
import { GK0020Page } from './pages/Cost/GK0020Page';
import { GK0030Page } from './pages/Cost/GK0030Page';
import { SR0010Page } from './pages/Purchase/SR0010Page';
import { UR0010Page } from './pages/Sales/UR0010Page';
import { VM0010Page } from './pages/Closing/VM0010Page';

const { Paragraph, Title, Text } = Typography;

export const App: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');

  const renderContent = () => {
    switch (activeMenu) {
      // 05_マスタ (Master Data Management - Milestone 1)
      case 'ad1780c':
        return <JyucyuMasterPage />;

      case 'ad1790c':
        return <SiireMasterPage />;

      case 'ad1730c':
        return <UserMasterPage />;

      case 'ad1720c':
        return <UserGrpMasterPage />;

      case 'ad1760c':
        return <SysNameMasterPage />;

      case 'ad1770c':
        return <ControlMasterPage />;

      // Other phases
      case 'gk0010':
        return <GK0010Page />;

      case 'gk0020':
        return <GK0020Page />;

      case 'gk0030':
        return <GK0030Page />;

      case 'sr0010':
        return <SR0010Page />;

      case 'ur0010':
        return <UR0010Page />;

      case 'vm0010':
        return <VM0010Page />;

      case 'dashboard':
      default:
        return (
          <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
            <Alert
              title="マスタ管理システム稼働中 (Version V0.0.0_master_data)"
              description="株式会社ミツヒデ 原価管理システムの第1フェーズ「マスタ管理 (05_マスタ)」が配備完了しました。左側メニューまたは下記のアクションから各マスタの登録・照会・編集・削除機能をご確認いただけます。"
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
            />

            {/* Master Data KPI Cards */}
            <Row gutter={16}>
              <Col span={6}>
                <Card variant="borderless" hoverable onClick={() => setActiveMenu('ad1780c')}>
                  <Statistic
                    title="受注先マスタ (AD1780C)"
                    value={4}
                    suffix="件"
                    prefix={<ShopOutlined />}
                    styles={{ content: { color: '#1890ff', fontWeight: 'bold' } }}
                  />
                  <small style={{ color: '#888' }}>主要元請・顧客台帳</small>
                </Card>
              </Col>
              <Col span={6}>
                <Card variant="borderless" hoverable onClick={() => setActiveMenu('ad1790c')}>
                  <Statistic
                    title="仕入先マスタ (AD1790C)"
                    value={6}
                    suffix="社"
                    prefix={<SolutionOutlined />}
                    styles={{ content: { color: '#52c41a', fontWeight: 'bold' } }}
                  />
                  <small style={{ color: '#888' }}>外注・資材加工仕入先</small>
                </Card>
              </Col>
              <Col span={6}>
                <Card variant="borderless" hoverable onClick={() => setActiveMenu('ad1730c')}>
                  <Statistic
                    title="社員ユーザー / グループ"
                    value={3}
                    suffix="名"
                    prefix={<TeamOutlined />}
                    styles={{ content: { color: '#722ed1', fontWeight: 'bold' } }}
                  />
                  <small style={{ color: '#888' }}>AD1730C / AD1720C 権限管理</small>
                </Card>
              </Col>
              <Col span={6}>
                <Card variant="borderless" hoverable onClick={() => setActiveMenu('ad1760c')}>
                  <Statistic
                    title="汎用区分 / 処理基準"
                    value={19}
                    suffix="定義"
                    prefix={<TagsOutlined />}
                    styles={{ content: { color: '#fa8c16', fontWeight: 'bold' } }}
                  />
                  <small style={{ color: '#888' }}>AD1760C (13件) + AD1770C (6件)</small>
                </Card>
              </Col>
            </Row>

            {/* Quick Actions for All Master Screens */}
            <Card title="マスタ管理 画面一覧・クイックアクセス" variant="borderless">
              <Paragraph type="secondary">
                クライアント様レビュー対象の全マスタ画面へダイレクトにアクセスできます。各画面でF1新規登録、F12保存、編集、検索が可能です。
              </Paragraph>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Card size="small" variant="borderless" style={{ background: '#f0f5ff' }}>
                    <Title level={5} style={{ margin: '0 0 8px 0', color: '#1890ff' }}>
                      <ShopOutlined /> 受注先マスタ (AD1780C)
                    </Title>
                    <Text type="secondary">得意先・元請会社のコード、名称、締日、入金区分を登録管理します。</Text>
                    <div style={{ marginTop: 12 }}>
                      <Button type="primary" size="small" onClick={() => setActiveMenu('ad1780c')}>
                        画面を開く
                      </Button>
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" variant="borderless" style={{ background: '#f6ffed' }}>
                    <Title level={5} style={{ margin: '0 0 8px 0', color: '#52c41a' }}>
                      <SolutionOutlined /> 仕入先マスタ (AD1790C)
                    </Title>
                    <Text type="secondary">資材・加工・外注協力会社のコード、名称、締日、支払条件を管理します。</Text>
                    <div style={{ marginTop: 12 }}>
                      <Button type="primary" size="small" style={{ background: '#52c41a', borderColor: '#52c41a' }} onClick={() => setActiveMenu('ad1790c')}>
                        画面を開く
                      </Button>
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" variant="borderless" style={{ background: '#f9f0ff' }}>
                    <Title level={5} style={{ margin: '0 0 8px 0', color: '#722ed1' }}>
                      <TeamOutlined /> ユーザーマスタ (AD1730C)
                    </Title>
                    <Text type="secondary">全社員・営業・工務・経理ユーザーのアカウント、パスワード、担当区分を保守します。</Text>
                    <div style={{ marginTop: 12 }}>
                      <Button type="primary" size="small" style={{ background: '#722ed1', borderColor: '#722ed1' }} onClick={() => setActiveMenu('ad1730c')}>
                        画面を開く
                      </Button>
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" variant="borderless" style={{ background: '#e6fffb' }}>
                    <Title level={5} style={{ margin: '0 0 8px 0', color: '#13c2c2' }}>
                      <TeamOutlined /> ユーザーグループ (AD1720C)
                    </Title>
                    <Text type="secondary">管理者・一般・部門別グループ権限および同時実行画面数を制御します。</Text>
                    <div style={{ marginTop: 12 }}>
                      <Button type="primary" size="small" style={{ background: '#13c2c2', borderColor: '#13c2c2' }} onClick={() => setActiveMenu('ad1720c')}>
                        画面を開く
                      </Button>
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" variant="borderless" style={{ background: '#fff7e6' }}>
                    <Title level={5} style={{ margin: '0 0 8px 0', color: '#fa8c16' }}>
                      <TagsOutlined /> システム名称マスタ (AD1760C)
                    </Title>
                    <Text type="secondary">未成/完成区分、請負形態、公民区分、税区分等の汎用コード名称を定義します。</Text>
                    <div style={{ marginTop: 12 }}>
                      <Button type="primary" size="small" style={{ background: '#fa8c16', borderColor: '#fa8c16' }} onClick={() => setActiveMenu('ad1760c')}>
                        画面を開く
                      </Button>
                    </div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" variant="borderless" style={{ background: '#fcffe6' }}>
                    <Title level={5} style={{ margin: '0 0 8px 0', color: '#ad8b00' }}>
                      <ControlOutlined /> 処理基準管理マスタ (AD1770C)
                    </Title>
                    <Text type="secondary">工事採番ルール、消費税端数処理、予算承認限度額等の基準値を設定管理します。</Text>
                    <div style={{ marginTop: 12 }}>
                      <Button type="primary" size="small" style={{ background: '#ad8b00', borderColor: '#ad8b00' }} onClick={() => setActiveMenu('ad1770c')}>
                        画面を開く
                      </Button>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* Release Info */}
            <Card variant="borderless">
              <Row justify="space-between" align="middle">
                <Col>
                  <Space align="center">
                    <Tag color="blue">Release: V0.0.0_master_data</Tag>
                    <Text type="secondary">ターゲットクライアント: 株式会社ミツヒデ 様 原価管理システム</Text>
                  </Space>
                </Col>
                <Col>
                  <Text type="secondary">Next Milestone: 工事受注・予算入力 (GK0010 / GK0020)</Text>
                </Col>
              </Row>
            </Card>
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
      <AntdApp>
        <MainLayout activeMenu={activeMenu} onSelectMenu={setActiveMenu}>
          {renderContent()}
        </MainLayout>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
