import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Space,
  Avatar,
  Badge,
  Tag,
  Button,
  Tooltip,
  Input,
  Dropdown,
} from 'antd';
import {
  HomeOutlined,
  SettingOutlined,
  ShopOutlined,
  SolutionOutlined,
  TeamOutlined,
  TagsOutlined,
  ControlOutlined,
  ProjectOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  SyncOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  UserOutlined,
  DatabaseOutlined,
  ExpandOutlined,
  CompressOutlined,
  SearchOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header, Content, Sider, Footer } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
  activeMenu: string;
  onSelectMenu: (key: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, activeMenu, onSelectMenu }) => {
  // Sidebar state
  const [collapsed, setCollapsed] = useState(false);
  const [siderWidth, setSiderWidth] = useState<number>(270); // 270 (Standard) or 330 (Wide)
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Responsive auto-collapse on tablet / small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Japanese Date Formatter (e.g. 2026年11月17日 (火) 令和8年)
  const today = new Date();
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const reiwaYear = today.getFullYear() - 2018;
  const dayOfWeek = dayNames[today.getDay()];
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 (${dayOfWeek}) 令和${reiwaYear}年`;

  // Toggle between Standard (270px) and Wide (330px)
  const toggleSiderWidth = () => {
    if (collapsed) {
      setCollapsed(false);
      setSiderWidth(270);
    } else if (siderWidth === 270) {
      setSiderWidth(330);
    } else {
      setSiderWidth(270);
    }
  };

  // Structured Enterprise Menu Items
  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <HomeOutlined style={{ fontSize: 16, color: '#38bdf8' }} />,
      label: (
        <span style={{ fontWeight: 600, letterSpacing: '0.02em' }}>
          ホーム / 概況
        </span>
      ),
    },
    {
      type: 'divider',
      style: { borderColor: 'rgba(255, 255, 255, 0.08)', margin: '8px 12px' },
    },
    {
      key: 'master',
      icon: <SettingOutlined style={{ fontSize: 16, color: '#60a5fa' }} />,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600 }}>マスタ管理 (AD)</span>
          {!collapsed && (
            <Tag color="#1d4ed8" style={{ border: 0, fontSize: 10, borderRadius: 10, margin: 0, padding: '0 6px' }}>
              6マスタ
            </Tag>
          )}
        </div>
      ),
      children: [
        {
          key: 'ad1780c',
          icon: <ShopOutlined style={{ color: '#3b82f6' }} />,
          label: (
            <span>
              受注先マスタ <span style={{ opacity: 0.6, fontSize: 11 }}>(AD1780C)</span>
            </span>
          ),
        },
        {
          key: 'ad1790c',
          icon: <SolutionOutlined style={{ color: '#10b981' }} />,
          label: (
            <span>
              仕入先マスタ <span style={{ opacity: 0.6, fontSize: 11 }}>(AD1790C)</span>
            </span>
          ),
        },
        {
          key: 'ad1730c',
          icon: <TeamOutlined style={{ color: '#a855f7' }} />,
          label: (
            <span>
              ユーザーマスタ <span style={{ opacity: 0.6, fontSize: 11 }}>(AD1730C)</span>
            </span>
          ),
        },
        {
          key: 'ad1720c',
          icon: <TeamOutlined style={{ color: '#06b6d4' }} />,
          label: (
            <span>
              ユーザーグループ <span style={{ opacity: 0.6, fontSize: 11 }}>(AD1720C)</span>
            </span>
          ),
        },
        {
          key: 'ad1760c',
          icon: <TagsOutlined style={{ color: '#f59e0b' }} />,
          label: (
            <span>
              システム名称 <span style={{ opacity: 0.6, fontSize: 11 }}>(AD1760C)</span>
            </span>
          ),
        },
        {
          key: 'ad1770c',
          icon: <ControlOutlined style={{ color: '#ec4899' }} />,
          label: (
            <span>
              処理基準管理 <span style={{ opacity: 0.6, fontSize: 11 }}>(AD1770C)</span>
            </span>
          ),
        },
      ],
    },
    {
      key: 'cost',
      icon: <ProjectOutlined style={{ fontSize: 16, color: '#34d399' }} />,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600 }}>原価・現場台帳 (GK)</span>
          {!collapsed && (
            <Tag color="#065f46" style={{ border: 0, fontSize: 10, borderRadius: 10, margin: 0, padding: '0 6px' }}>
              原価
            </Tag>
          )}
        </div>
      ),
      children: [
        { key: 'gk0010', label: '工事受注入力 (GK0010)' },
        { key: 'gk0020', label: '工事予算入力 (GK0020)' },
        { key: 'gk0030', label: '工事台帳照会 (GK0030)' },
      ],
    },
    {
      key: 'purchase',
      icon: <ShoppingCartOutlined style={{ fontSize: 16, color: '#fbbf24' }} />,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600 }}>購買・仕入業務 (SR)</span>
        </div>
      ),
      children: [
        { key: 'sr0010', label: '仕入入力 (SR0010)' },
      ],
    },
    {
      key: 'sales',
      icon: <DollarOutlined style={{ fontSize: 16, color: '#818cf8' }} />,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600 }}>売上・請求業務 (UR)</span>
        </div>
      ),
      children: [
        { key: 'ur0010', label: '工事種目明細入力 (UR0010)' },
      ],
    },
    {
      key: 'closing',
      icon: <SyncOutlined style={{ fontSize: 16, color: '#f43f5e' }} />,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600 }}>月次決算・更新 (VM)</span>
        </div>
      ),
      children: [
        { key: 'vm0010', label: '月次更新処理 (VM0010)' },
      ],
    },
  ];

  // User Profile Menu
  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', label: 'ユーザープロフィール' },
    { key: 'security', label: 'パスワード・セキュリティ変更' },
    { type: 'divider' },
    { key: 'logout', danger: true, label: 'ログアウト' },
  ];

  return (
    <Layout style={{ minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      {/* ==============================================================
          GORGEOUS SIDER (Responsive, Resizable, Modern Dark Styling)
          ============================================================== */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={siderWidth}
        collapsedWidth={80}
        className="mitsuhide-sider"
        style={{
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.25)',
          zIndex: 20,
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Brand Area */}
        <div
          style={{
            height: 68,
            display: 'flex',
            alignItems: 'center',
            padding: collapsed ? '0 20px' : '0 20px',
            background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            cursor: 'pointer',
          }}
          onClick={() => onSelectMenu('dashboard')}
        >
          {/* Logo Mark */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 18, fontFamily: 'serif' }}>光</span>
          </div>

          {/* Logo Text (Visible when expanded) */}
          {!collapsed && (
            <div style={{ marginLeft: 14, overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: 15, letterSpacing: '0.04em' }}>
                  株式会社ミツヒデ
                </span>
                <span className="erp-status-pulse" title="System Online" />
              </div>
              <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 500, letterSpacing: '0.02em' }}>
                原価管理 ERP システム
              </div>
            </div>
          )}
        </div>

        {/* Menu Navigation Container */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px 0' }}>
          <Menu
            theme="dark"
            selectedKeys={[activeMenu]}
            defaultOpenKeys={['master', 'cost']}
            mode="inline"
            items={menuItems}
            onClick={({ key }) => onSelectMenu(key)}
            className="mitsuhide-menu"
          />
        </div>

        {/* Sider Bottom Widget (Database & Resizer) */}
        {!collapsed && (
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(15, 23, 42, 0.75)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Space size={6}>
                <DatabaseOutlined style={{ color: '#10b981', fontSize: 13 }} />
                <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>SQL Server 2019</span>
              </Space>
              <Tooltip title={siderWidth === 270 ? 'メニュー幅を広げる (Wide)' : '標準幅に戻す (Standard)'}>
                <Button
                  type="text"
                  size="small"
                  icon={siderWidth === 270 ? <ExpandOutlined /> : <CompressOutlined />}
                  onClick={toggleSiderWidth}
                  style={{ color: '#94a3b8', fontSize: 11 }}
                >
                  {siderWidth === 270 ? '拡大' : '縮小'}
                </Button>
              </Tooltip>
            </div>
            <div style={{ color: '#64748b', fontSize: 10, display: 'flex', justifyContent: 'space-between' }}>
              <span>mitsuhide_cost_db</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>● 接続中</span>
            </div>
          </div>
        )}
      </Sider>

      {/* ==============================================================
          MAIN CONTENT AREA & MODERN GLASS HEADER
          ============================================================== */}
      <Layout style={{ background: '#f8fafc', flex: 1, minWidth: 0 }}>
        {/* Modern Sticky Glass Header */}
        <Header
          style={{
            padding: '0 24px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e2e8f0',
            height: 68,
            position: 'sticky',
            top: 0,
            zIndex: 15,
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
          }}
        >
          {/* Left: Collapse Toggle & Breadcrumb Title */}
          <Space size="middle" align="center">
            <Tooltip title={collapsed ? 'サイドバーを開く' : 'サイドバーを閉じる'}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: 18,
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  color: '#1e293b',
                  background: '#f1f5f9',
                }}
              />
            </Tooltip>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
                  工事原価・受注・売上・仕入管理システム
                </span>
                <Tag
                  color="blue"
                  style={{
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    border: '1px solid #bfdbfe',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                  }}
                >
                  <CheckCircleFilled style={{ color: '#2563eb', marginRight: 4 }} />
                  稼働中 (R8)
                </Tag>
              </div>
            </div>
          </Space>

          {/* Right: Quick Search, Date, Notifications & User Profile */}
          <Space size="middle" align="center">
            {/* Quick Master Filter / Navigation Search */}
            <Input
              placeholder="画面コード / 検索 (例: AD1780C)..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={() => {
                const kw = searchKeyword.trim().toLowerCase();
                if (kw.includes('1780') || kw.includes('受注')) onSelectMenu('ad1780c');
                else if (kw.includes('1790') || kw.includes('仕入先')) onSelectMenu('ad1790c');
                else if (kw.includes('1730') || kw.includes('ユーザー')) onSelectMenu('ad1730c');
                else if (kw.includes('1720') || kw.includes('グループ')) onSelectMenu('ad1720c');
                else if (kw.includes('1760') || kw.includes('名称')) onSelectMenu('ad1760c');
                else if (kw.includes('1770') || kw.includes('基準')) onSelectMenu('ad1770c');
                else if (kw.includes('gk') || kw.includes('工事')) onSelectMenu('gk0010');
              }}
              style={{
                width: 220,
                borderRadius: 20,
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
              }}
            />

            {/* Live Japanese Calendar Date Pill */}
            <div
              style={{
                background: '#f1f5f9',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 12.5,
                fontWeight: 600,
                color: '#475569',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>📅</span>
              <span>{dateStr}</span>
            </div>

            {/* Notification Bell */}
            <Tooltip title="新着通知">
              <Badge count={0} dot>
                <Button
                  type="text"
                  shape="circle"
                  icon={<BellOutlined style={{ fontSize: 17, color: '#475569' }} />}
                  style={{ background: '#f1f5f9', width: 38, height: 38 }}
                />
              </Badge>
            </Tooltip>

            {/* User Profile Pill */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  padding: '4px 12px 4px 6px',
                  borderRadius: 24,
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s',
                }}
              >
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: '#2563eb',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
                  }}
                />
                <div style={{ lineHeight: 1.25, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>酒井 太郎</div>
                  <div style={{ fontSize: 10.5, color: '#64748b' }}>営業部 / 管理者</div>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Dynamic Page Content */}
        <Content
          style={{
            margin: '24px 28px',
            minHeight: 'calc(100vh - 150px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Content>

        {/* Modern Elegant Footer */}
        <Footer
          style={{
            textAlign: 'center',
            color: '#94a3b8',
            padding: '16px 28px',
            fontSize: 12,
            background: 'transparent',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          株式会社ミツヒデ 原価管理システム Web版 ©{today.getFullYear()} All Rights Reserved. | SQL Server 2019 Express
        </Footer>
      </Layout>
    </Layout>
  );
};
