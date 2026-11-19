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
  Drawer,
  Modal,
} from 'antd';
import {
  HomeOutlined,
  SettingOutlined,
  ShopOutlined,
  SolutionOutlined,
  TeamOutlined,
  TagsOutlined,
  ControlOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  UserOutlined,
  DatabaseOutlined,
  ExpandOutlined,
  CompressOutlined,
  SearchOutlined,
  CheckCircleFilled,
  CalendarOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useDeviceType } from '../../hooks/useDeviceType';
import { useAuth } from '../../context/AuthContext';

const { Header, Content, Sider } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
  activeMenu: string;
  onSelectMenu: (key: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, activeMenu, onSelectMenu }) => {
  const { isMobile, isTablet, isDesktop } = useDeviceType();
  const { user, logout } = useAuth();

  // Sidebar state
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [siderWidth, setSiderWidth] = useState<number>(270); // 270 (Standard) or 330 (Wide)
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Auto-collapse sidebar on tablet / small screens
  useEffect(() => {
    if (isTablet) {
      setCollapsed(true);
    } else if (isDesktop) {
      setCollapsed(false);
    }
  }, [isTablet, isDesktop]);

  const handleSelectMenu = (key: string) => {
    onSelectMenu(key);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  // Live Japanese Imperial & Western Date/Time with live clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const reiwaYear = currentTime.getFullYear() - 2018;
  const dayOfWeek = dayNames[currentTime.getDay()];
  const dateBaseStr = `${currentTime.getFullYear()}年${currentTime.getMonth() + 1}月${currentTime.getDate()}日 (${dayOfWeek})`;
  const eraStr = `令和${reiwaYear}年`;
  const timeStr = currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

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

  // Structured Enterprise Menu Items filtered by Access Control Role (プログラム一覧.xls)
  // Master Management (AD17xxC) and Monthly Closing (VM0010) are restricted to syubetu: 9 (経理) or userGrpCd: '9' (管理者)
  const isAdminOrAccounting = user?.syubetu === 9 || user?.userGrpCd === '9';

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
    ...(isAdminOrAccounting
      ? [
          {
            type: 'divider' as const,
            style: { borderColor: 'rgba(255, 255, 255, 0.08)', margin: '8px 12px' },
          },
          {
            key: 'master',
            icon: <DatabaseOutlined style={{ fontSize: 16, color: '#38bdf8' }} />,
            label: (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>マスタ</span>
                {!collapsed && (
                  <Tag color="#0284c7" style={{ border: 0, fontSize: 10, borderRadius: 10, margin: 0, padding: '0 6px' }}>
                    3
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
                    ユーザマスタ <span style={{ opacity: 0.6, fontSize: 11 }}>(AD1730C)</span>
                  </span>
                ),
              },
            ],
          },
          {
            key: 'system',
            icon: <SettingOutlined style={{ fontSize: 16, color: '#a78bfa' }} />,
            label: (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>システム</span>
                {!collapsed && (
                  <Tag color="#7c3aed" style={{ border: 0, fontSize: 10, borderRadius: 10, margin: 0, padding: '0 6px' }}>
                    5
                  </Tag>
                )}
              </div>
            ),
            children: [
              {
                key: 'ad1720c',
                icon: <TeamOutlined style={{ color: '#06b6d4' }} />,
                label: (
                  <span>
                    ユーザーグループマスタ <span style={{ opacity: 0.6, fontSize: 11 }}>(AD1720C)</span>
                  </span>
                ),
              },
              {
                key: 'ad1740c',
                icon: <AppstoreOutlined style={{ color: '#38bdf8' }} />,
                label: (
                  <span>
                    プログラムマスタ <span style={{ opacity: 0.6, fontSize: 11 }}>(AD1740C)</span>
                  </span>
                ),
              },
              {
                key: 'ad1750c',
                icon: <MessageOutlined style={{ color: '#c026d3' }} />,
                label: (
                  <span>
                    メッセージマスタ <span style={{ opacity: 0.6, fontSize: 11 }}>(AD1750C)</span>
                  </span>
                ),
              },
              {
                key: 'ad1760c',
                icon: <TagsOutlined style={{ color: '#f59e0b' }} />,
                label: (
                  <span>
                    システム名称マスタ <span style={{ opacity: 0.6, fontSize: 11 }}>(AD1760C)</span>
                  </span>
                ),
              },
              {
                key: 'ad1770c',
                icon: <ControlOutlined style={{ color: '#ec4899' }} />,
                label: (
                  <span>
                    処理基準管理マスタ <span style={{ opacity: 0.6, fontSize: 11 }}>(AD1770C)</span>
                  </span>
                ),
              },
            ],
          },
        ]
      : []),
  ];

  // User Profile Menu
  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      Modal.confirm({
        title: 'ログアウト確認',
        content: '工事管理システムからログアウトしますか？',
        okText: 'ログアウト',
        cancelText: 'キャンセル',
        okButtonProps: { danger: true },
        onOk: () => {
          logout();
        },
      });
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'userinfo',
      disabled: true,
      label: (
        <div style={{ color: '#0f172a', fontWeight: 600 }}>
          <div>{user?.userName || '未ログイン'}</div>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>
            社員CD: {user?.userCd || '------'}
          </div>
        </div>
      ),
    },
    { type: 'divider' },
    { key: 'logout', danger: true, icon: <LogoutOutlined />, label: 'ログアウト' },
  ];

  return (
    <Layout style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* ==============================================================
          GORGEOUS SIDER (Desktop & Tablet)
          ============================================================== */}
      {!isMobile && (
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
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
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
            onClick={() => handleSelectMenu('dashboard')}
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
              defaultOpenKeys={['master', 'system']}
              mode="inline"
              items={menuItems}
              onClick={({ key }) => handleSelectMenu(key)}
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
      )}

      {/* ==============================================================
          SMART MOBILE DRAWER (For Phones & Smart Devices < 768px)
          ============================================================== */}
      {isMobile && (
        <Drawer
          placement="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          width={280}
          styles={{
            body: { padding: 0, background: '#090d16' },
            header: { background: '#090d16', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#fff' },
          }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>光</span>
              </div>
              <div>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 14 }}>
                  株式会社ミツヒデ
                </div>
                <div style={{ color: '#94a3b8', fontSize: 10 }}>
                  原価管理 ERP
                </div>
              </div>
            </div>
          }
        >
          <div style={{ padding: '12px 0', height: '100%', overflowY: 'auto' }}>
            <Menu
              theme="dark"
              selectedKeys={[activeMenu]}
              defaultOpenKeys={['master', 'system']}
              mode="inline"
              items={menuItems}
              onClick={({ key }) => handleSelectMenu(key)}
              className="mitsuhide-menu"
            />
          </div>
        </Drawer>
      )}

      {/* ==============================================================
          MAIN CONTENT AREA & MODERN GLASS HEADER
          ============================================================== */}
      <Layout style={{ background: '#f8fafc', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Modern Sticky Glass Header */}
        <Header
          style={{
            flexShrink: 0,
            padding: isMobile ? '0 12px' : isTablet ? '0 16px' : '0 24px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e2e8f0',
            height: isMobile ? 56 : 64,
            zIndex: 15,
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
          }}
        >
          {/* Left: Collapse Toggle & Adaptive Brand Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1, marginRight: 12 }}>
            <Tooltip title={isMobile ? 'メニューを開く' : collapsed ? 'サイドバーを開く' : 'サイドバーを閉じる'}>
              <Button
                type="text"
                icon={isMobile || collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => {
                  if (isMobile) {
                    setMobileDrawerOpen(!mobileDrawerOpen);
                  } else {
                    setCollapsed(!collapsed);
                  }
                }}
                style={{
                  fontSize: 18,
                  width: 38,
                  height: 38,
                  minWidth: 38,
                  borderRadius: 8,
                  color: '#1e293b',
                  background: '#f1f5f9',
                  flexShrink: 0,
                }}
              />
            </Tooltip>

            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              {(() => {
                const pageHeaderMeta: Record<
                  string,
                  { title: string; shortTitle: string; category: string; tagColor: string; icon: React.ReactNode; iconBg: string }
                > = {
                  ad1780c: {
                    title: '受注先マスタメンテナンス (AD1780C)',
                    shortTitle: '受注先マスタ (AD1780C)',
                    category: 'マスタ',
                    tagColor: 'blue',
                    icon: <ShopOutlined style={{ fontSize: 18, color: '#2563eb' }} />,
                    iconBg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  },
                  ad1790c: {
                    title: '仕入先マスタメンテナンス (AD1790C)',
                    shortTitle: '仕入先マスタ (AD1790C)',
                    category: 'マスタ',
                    tagColor: 'green',
                    icon: <SolutionOutlined style={{ fontSize: 18, color: '#10b981' }} />,
                    iconBg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  },
                  ad1730c: {
                    title: 'ユーザマスタメンテナンス (AD1730C)',
                    shortTitle: 'ユーザマスタ (AD1730C)',
                    category: 'マスタ',
                    tagColor: 'purple',
                    icon: <TeamOutlined style={{ fontSize: 18, color: '#9333ea' }} />,
                    iconBg: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                  },
                  ad1720c: {
                    title: 'ユーザグループマスタメンテナンス (AD1720C)',
                    shortTitle: 'グループマスタ (AD1720C)',
                    category: 'システム',
                    tagColor: 'cyan',
                    icon: <TeamOutlined style={{ fontSize: 18, color: '#0891b2' }} />,
                    iconBg: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
                  },
                  ad1740c: {
                    title: 'プログラムマスタメンテナンス (AD1740C)',
                    shortTitle: 'プログラムマスタ (AD1740C)',
                    category: 'システム',
                    tagColor: 'geekblue',
                    icon: <AppstoreOutlined style={{ fontSize: 18, color: '#0284c7' }} />,
                    iconBg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  },
                  ad1750c: {
                    title: 'メッセージマスタメンテナンス (AD1750C)',
                    shortTitle: 'メッセージマスタ (AD1750C)',
                    category: 'システム',
                    tagColor: 'magenta',
                    icon: <MessageOutlined style={{ fontSize: 18, color: '#c026d3' }} />,
                    iconBg: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
                  },
                  ad1760c: {
                    title: 'システム名称マスタメンテナンス (AD1760C)',
                    shortTitle: 'システム名称マスタ (AD1760C)',
                    category: 'システム',
                    tagColor: 'orange',
                    icon: <TagsOutlined style={{ fontSize: 18, color: '#d97706' }} />,
                    iconBg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                  },
                  ad1770c: {
                    title: '処理基準管理マスタメンテナンス (AD1770C)',
                    shortTitle: '処理基準管理マスタ (AD1770C)',
                    category: 'システム',
                    tagColor: 'volcano',
                    icon: <ControlOutlined style={{ fontSize: 18, color: '#db2777' }} />,
                    iconBg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                  },
                };

                const currentMeta = pageHeaderMeta[activeMenu];

                if (currentMeta) {
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 9,
                          background: currentMeta.iconBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: '1px solid rgba(15, 23, 42, 0.06)',
                        }}
                      >
                        {currentMeta.icon}
                      </div>
                      <span
                        className="erp-header-title"
                        style={{
                          fontSize: isMobile ? 14 : isTablet ? 15 : 17,
                          fontWeight: 800,
                          color: '#0f172a',
                          letterSpacing: '-0.01em',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={currentMeta.title}
                      >
                        {isMobile ? currentMeta.shortTitle : currentMeta.title}
                      </span>
                      {!isMobile && (
                        <Tag
                          color={currentMeta.tagColor}
                          style={{
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 700,
                            padding: '1px 8px',
                            margin: 0,
                            flexShrink: 0,
                          }}
                        >
                          {currentMeta.category}
                        </Tag>
                      )}
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      className="erp-header-title"
                      style={{
                        fontSize: isMobile ? 14 : isTablet ? 15 : 16,
                        fontWeight: 700,
                        color: '#0f172a',
                        letterSpacing: '-0.01em',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title="株式会社ミツヒデ 原価管理システム"
                    >
                      {isMobile ? 'ミツヒデ 原価管理' : isTablet ? '株式会社ミツヒデ 原価管理' : '株式会社ミツヒデ 原価管理システム'}
                    </span>
                    {!isMobile && (
                      <Tag
                        color="blue"
                        className="erp-header-status-tag"
                        style={{
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 600,
                          border: '1px solid #bfdbfe',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          flexShrink: 0,
                        }}
                      >
                        <CheckCircleFilled style={{ color: '#2563eb', marginRight: 4 }} />
                        稼働中 (R8)
                      </Tag>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Right: Quick Search, Date, Notifications & User Profile */}
          <Space size={isMobile ? 8 : 12} align="center" style={{ flexShrink: 0 }}>
            {/* Quick Master Filter / Navigation Search */}
            {!isMobile && (
              <Input
                className="erp-header-search"
                placeholder="画面CD / 検索..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onPressEnter={() => {
                  const kw = searchKeyword.trim().toLowerCase();
                  if (kw.includes('1780') || kw.includes('受注')) onSelectMenu('ad1780c');
                  else if (kw.includes('1790') || kw.includes('仕入先')) onSelectMenu('ad1790c');
                  else if (kw.includes('1730') || kw.includes('ユーザー') || kw.includes('社員')) onSelectMenu('ad1730c');
                  else if (kw.includes('1720') || kw.includes('グループ') || kw.includes('権限')) onSelectMenu('ad1720c');
                  else if (kw.includes('1740') || kw.includes('プログラム') || kw.includes('メニュー')) onSelectMenu('ad1740c');
                  else if (kw.includes('1750') || kw.includes('メッセージ') || kw.includes('msg')) onSelectMenu('ad1750c');
                  else if (kw.includes('1760') || kw.includes('名称') || kw.includes('コード')) onSelectMenu('ad1760c');
                  else if (kw.includes('1770') || kw.includes('基準') || kw.includes('採番')) onSelectMenu('ad1770c');
                }}
              />
            )}

            {/* Live Japanese Calendar Date & Real-time Clock Pill */}
            <div
              className="erp-header-datetime"
              title={`${dateBaseStr} ${eraStr} ${timeStr}`}
            >
              <CalendarOutlined style={{ color: '#2563eb', fontSize: 14 }} />
              <span className="erp-header-date-text">{dateBaseStr}</span>
              <Tag
                className="erp-header-era"
                color="blue"
                style={{
                  margin: 0,
                  fontSize: 10.5,
                  padding: '0 6px',
                  borderRadius: 6,
                  lineHeight: '18px',
                  border: 'none',
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  fontWeight: 700,
                }}
              >
                {eraStr}
              </Tag>
              <span className="erp-header-time-divider" style={{ color: '#cbd5e1' }}>|</span>
              <ClockCircleOutlined style={{ color: '#0284c7', fontSize: 13 }} />
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: '#0f172a' }}>
                {timeStr}
              </span>
            </div>

            {/* Notification Bell */}
            <Tooltip title="新着通知">
              <Badge count={0} dot>
                <Button
                  type="text"
                  shape="circle"
                  icon={<BellOutlined style={{ fontSize: 17, color: '#475569' }} />}
                  style={{ background: '#f1f5f9', width: 36, height: 36 }}
                />
              </Badge>
            </Tooltip>

            {/* User Profile Pill */}
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight" trigger={['click']}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  padding: isMobile || isTablet ? '3px' : '4px 12px 4px 6px',
                  borderRadius: 24,
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s',
                }}
                title={user ? `${user.userName} (${user.syubetuNm})` : 'ユーザーメニュー'}
              >
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: user?.userGrpCd === '9' ? '#722ed1' : '#2563eb',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
                    flexShrink: 0,
                  }}
                />
                {!isMobile && !isTablet && (
                  <div style={{ lineHeight: 1.25, textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                      {user?.userName || '未ログイン'}
                    </div>
                    <div style={{ fontSize: 10.5, color: '#64748b' }}>
                      {user ? `${user.syubetuNm} / ${user.userGrpNm || '一般'}` : 'ログオン待ち'}
                    </div>
                  </div>
                )}
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Scrollable Container for Page Content & Footer */}
        <div
          id="main-scroll-container"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Dynamic Page Content */}
          <Content
            style={{
              margin: isMobile ? '12px 10px' : isTablet ? '16px 18px' : '24px 28px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </Content>
        </div>
      </Layout>
    </Layout>
  );
};
