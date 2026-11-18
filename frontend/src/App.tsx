import React, { useState, useEffect } from 'react';
import {
  ConfigProvider,
  App as AntdApp,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  Typography,
} from 'antd';
import jaJP from 'antd/locale/ja_JP';
import {
  TeamOutlined,
  ShopOutlined,
  SolutionOutlined,
  TagsOutlined,
  ControlOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { MainLayout } from './components/Layout/MainLayout';
import { apiClient } from './api/client';
import { JyucyuMasterPage } from './pages/Master/JyucyuMasterPage';
import { SiireMasterPage } from './pages/Master/SiireMasterPage';
import { UserMasterPage } from './pages/Master/UserMasterPage';
import { UserGrpMasterPage } from './pages/Master/UserGrpMasterPage';
import { SysNameMasterPage } from './pages/Master/SysNameMasterPage';
import { ControlMasterPage } from './pages/Master/ControlMasterPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/Auth/LoginPage';
import { SessionTimeoutWatcher } from './components/Auth/SessionTimeoutWatcher';

const { Paragraph, Title, Text } = Typography;

const MainApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');

  // Real-time Master Counts loaded from backend
  const [counts, setCounts] = useState({
    jyucyu: 4,
    siire: 6,
    user: 3,
    userGrp: 2,
    sysName: 13,
    control: 6,
  });

  useEffect(() => {
    // Fetch live counts from API if available
    const loadCounts = async () => {
      try {
        const [jRes, sRes, uRes, gRes, nRes, cRes] = await Promise.allSettled([
          apiClient.get('/jyucyu', { params: { pageSize: 1 } }),
          apiClient.get('/siire', { params: { pageSize: 1 } }),
          apiClient.get('/user', { params: { pageSize: 1 } }),
          apiClient.get('/usergrp', { params: { pageSize: 1 } }),
          apiClient.get('/sysname', { params: { pageSize: 1 } }),
          apiClient.get('/control', { params: { pageSize: 1 } }),
        ]);

        setCounts({
          jyucyu: jRes.status === 'fulfilled' ? jRes.value.data.totalCount || 4 : 4,
          siire: sRes.status === 'fulfilled' ? sRes.value.data.totalCount || 6 : 6,
          user: uRes.status === 'fulfilled' ? uRes.value.data.totalCount || 3 : 3,
          userGrp: gRes.status === 'fulfilled' ? gRes.value.data.totalCount || 2 : 2,
          sysName: nRes.status === 'fulfilled' ? nRes.value.data.totalCount || 13 : 13,
          control: cRes.status === 'fulfilled' ? cRes.value.data.totalCount || 6 : 6,
        });
      } catch {
        // Fallback to initial seed counts
      }
    };
    loadCounts();
  }, []);

  const renderContent = () => {
    switch (activeMenu) {
      // 05_マスタ (Master Data Management)
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

      case 'dashboard':
      default:
        return (
          <Space orientation="vertical" size={24} style={{ width: '100%' }}>
            {/* ==============================================================
                HERO BANNER: Clean, Professional Welcome Header
                ============================================================== */}
            <div className="erp-hero-banner">
              <Row justify="space-between" align="middle" gutter={[16, 16]}>
                <Col xs={24} md={15}>
                  <Title level={2} className="erp-hero-title">
                    株式会社ミツヒデ 原価管理システム
                  </Title>

                  <Paragraph className="erp-hero-desc">
                    得意先、仕入先、社内ユーザーおよび各種共通コードの登録・照会・編集を行います。各マスタカードをクリックして管理画面へ移動してください。
                  </Paragraph>
                </Col>

                <Col xs={24} md={9} className="erp-hero-actions">
                  <Space size={10} wrap>
                    <Button
                      type="primary"
                      className="erp-hero-btn primary"
                      icon={<ShopOutlined />}
                      onClick={() => setActiveMenu('ad1780c')}
                    >
                      受注先マスタ
                    </Button>

                    <Button
                      className="erp-hero-btn secondary"
                      icon={<SolutionOutlined />}
                      onClick={() => setActiveMenu('ad1790c')}
                    >
                      仕入先マスタ
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>

            {/* ==============================================================
                6 CLEAN MASTER DATA CARDS
                ============================================================== */}
            <div>
              <div style={{ marginBottom: 16 }}>
                <Title level={4} className="erp-section-title">
                  マスタ一覧
                </Title>
                <Text type="secondary" className="erp-page-desc">
                  管理したいマスタをクリックすると、登録・照会・編集画面が開きます。
                </Text>
              </div>

              <Row gutter={[16, 16]}>
                {/* 1. 受注先マスタ */}
                <Col xs={24} sm={12} lg={8}>
                  <Card
                    hoverable
                    className="erp-hover-card erp-master-card"
                    onClick={() => setActiveMenu('ad1780c')}
                    style={{ borderRadius: 12, cursor: 'pointer', overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <span className="erp-card-category">主要元請・顧客台帳</span>
                        <div className="erp-card-title">
                          受注先マスタ (AD1780C)
                        </div>
                      </div>
                      <div
                        className="erp-card-icon-box"
                        style={{
                          borderRadius: 12,
                          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ShopOutlined style={{ color: '#2563eb' }} />
                      </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <Statistic
                        value={counts.jyucyu}
                        suffix="件"
                        className="erp-stat-value"
                        styles={{ content: { color: '#2563eb' } }}
                      />
                    </div>

                    <div className="erp-card-footer">
                      <span className="erp-card-footer-desc">締日・集金条件・入金区分保守</span>
                      <span className="erp-card-footer-action" style={{ color: '#2563eb' }}>
                        画面を開く <ArrowRightOutlined />
                      </span>
                    </div>
                  </Card>
                </Col>

                {/* 2. 仕入先マスタ */}
                <Col xs={24} sm={12} lg={8}>
                  <Card
                    hoverable
                    className="erp-hover-card erp-master-card"
                    onClick={() => setActiveMenu('ad1790c')}
                    style={{ borderRadius: 12, cursor: 'pointer', overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <span className="erp-card-category">外注・資材加工仕入先</span>
                        <div className="erp-card-title">
                          仕入先マスタ (AD1790C)
                        </div>
                      </div>
                      <div
                        className="erp-card-icon-box"
                        style={{
                          borderRadius: 12,
                          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <SolutionOutlined style={{ color: '#10b981' }} />
                      </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <Statistic
                        value={counts.siire}
                        suffix="社"
                        className="erp-stat-value"
                        styles={{ content: { color: '#10b981' } }}
                      />
                    </div>

                    <div className="erp-card-footer">
                      <span className="erp-card-footer-desc">外注協力会社・資材コード保守</span>
                      <span className="erp-card-footer-action" style={{ color: '#10b981' }}>
                        画面を開く <ArrowRightOutlined />
                      </span>
                    </div>
                  </Card>
                </Col>

                {/* 3. ユーザーマスタ */}
                <Col xs={24} sm={12} lg={8}>
                  <Card
                    hoverable
                    className="erp-hover-card erp-master-card"
                    onClick={() => setActiveMenu('ad1730c')}
                    style={{ borderRadius: 12, cursor: 'pointer', overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <span className="erp-card-category">全社員・担当者アカウント</span>
                        <div className="erp-card-title">
                          ユーザーマスタ (AD1730C)
                        </div>
                      </div>
                      <div
                        className="erp-card-icon-box"
                        style={{
                          borderRadius: 12,
                          background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <TeamOutlined style={{ color: '#8b5cf6' }} />
                      </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <Statistic
                        value={counts.user}
                        suffix="名"
                        className="erp-stat-value"
                        styles={{ content: { color: '#8b5cf6' } }}
                      />
                    </div>

                    <div className="erp-card-footer">
                      <span className="erp-card-footer-desc">パスワード・担当部門権限保守</span>
                      <span className="erp-card-footer-action" style={{ color: '#8b5cf6' }}>
                        画面を開く <ArrowRightOutlined />
                      </span>
                    </div>
                  </Card>
                </Col>

                {/* 4. ユーザーグループ */}
                <Col xs={24} sm={12} lg={8}>
                  <Card
                    hoverable
                    className="erp-hover-card erp-master-card"
                    onClick={() => setActiveMenu('ad1720c')}
                    style={{ borderRadius: 12, cursor: 'pointer', overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <span className="erp-card-category">権限グループ・同時実行数</span>
                        <div className="erp-card-title">
                          ユーザーグループ (AD1720C)
                        </div>
                      </div>
                      <div
                        className="erp-card-icon-box"
                        style={{
                          borderRadius: 12,
                          background: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <SafetyCertificateOutlined style={{ color: '#06b6d4' }} />
                      </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <Statistic
                        value={counts.userGrp}
                        suffix="グループ"
                        className="erp-stat-value"
                        styles={{ content: { color: '#06b6d4' } }}
                      />
                    </div>

                    <div className="erp-card-footer">
                      <span className="erp-card-footer-desc">同時稼働アプリ本数制限制御</span>
                      <span className="erp-card-footer-action" style={{ color: '#06b6d4' }}>
                        画面を開く <ArrowRightOutlined />
                      </span>
                    </div>
                  </Card>
                </Col>

                {/* 5. システム名称マスタ */}
                <Col xs={24} sm={12} lg={8}>
                  <Card
                    hoverable
                    className="erp-hover-card erp-master-card"
                    onClick={() => setActiveMenu('ad1760c')}
                    style={{ borderRadius: 12, cursor: 'pointer', overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <span className="erp-card-category">汎用区分・コード定義</span>
                        <div className="erp-card-title">
                          システム名称 (AD1760C)
                        </div>
                      </div>
                      <div
                        className="erp-card-icon-box"
                        style={{
                          borderRadius: 12,
                          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <TagsOutlined style={{ color: '#f59e0b' }} />
                      </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <Statistic
                        value={counts.sysName}
                        suffix="定義"
                        className="erp-stat-value"
                        styles={{ content: { color: '#f59e0b' } }}
                      />
                    </div>

                    <div className="erp-card-footer">
                      <span className="erp-card-footer-desc">工事種目・公民・税区分設定</span>
                      <span className="erp-card-footer-action" style={{ color: '#f59e0b' }}>
                        画面を開く <ArrowRightOutlined />
                      </span>
                    </div>
                  </Card>
                </Col>

                {/* 6. 処理基準管理マスタ */}
                <Col xs={24} sm={12} lg={8}>
                  <Card
                    hoverable
                    className="erp-hover-card erp-master-card"
                    onClick={() => setActiveMenu('ad1770c')}
                    style={{ borderRadius: 12, cursor: 'pointer', overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <span className="erp-card-category">採番・消費税・端数基準</span>
                        <div className="erp-card-title">
                          処理基準管理 (AD1770C)
                        </div>
                      </div>
                      <div
                        className="erp-card-icon-box"
                        style={{
                          borderRadius: 12,
                          background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ControlOutlined style={{ color: '#ec4899' }} />
                      </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <Statistic
                        value={counts.control}
                        suffix="基準"
                        className="erp-stat-value"
                        styles={{ content: { color: '#ec4899' } }}
                      />
                    </div>

                    <div className="erp-card-footer">
                      <span className="erp-card-footer-desc">工事番号自動付番ルール保守</span>
                      <span className="erp-card-footer-action" style={{ color: '#ec4899' }}>
                        画面を開く <ArrowRightOutlined />
                      </span>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          </Space>
        );
    }
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <MainLayout activeMenu={activeMenu} onSelectMenu={setActiveMenu}>
      {renderContent()}
    </MainLayout>
  );
};

export const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={jaJP}
      theme={{
        token: {
          colorPrimary: '#2563eb', // Executive Royal Blue
          colorInfo: '#0284c7',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          borderRadius: 8,
          fontFamily: "'Plus Jakarta Sans', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        components: {
          Card: {
            colorBgContainer: '#ffffff',
            boxShadowTertiary: '0 2px 8px rgba(15, 23, 42, 0.04)',
          },
          Table: {
            headerBg: '#f8fafc',
            headerColor: '#0f172a',
            rowHoverBg: '#f1f5f9',
          },
          Button: {
            controlHeight: 38,
            borderRadius: 8,
            fontWeight: 600,
          },
        },
      }}
    >
      <AntdApp>
        <AuthProvider>
          <SessionTimeoutWatcher />
          <MainApp />
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
