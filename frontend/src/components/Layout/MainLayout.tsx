import React, { useState } from 'react';
import { Layout, Menu, Space, Avatar, Badge, Tag, Button, Tooltip } from 'antd';
import {
  HomeOutlined,
  ProjectOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  SyncOutlined,
  SettingOutlined,
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header, Content, Sider, Footer } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
  activeMenu: string;
  onSelectMenu: (key: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, activeMenu, onSelectMenu }) => {
  const [collapsed, setCollapsed] = useState(false);

  // Japanese Date Formatter (e.g. 2026年11月13日 (令和8年))
  const today = new Date();
  const reiwaYear = today.getFullYear() - 2018;
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 (令和${reiwaYear}年)`;

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: 'ホーム / 業務状況',
    },
    {
      key: 'cost',
      icon: <ProjectOutlined />,
      label: '原価管理 (GK)',
      children: [
        { key: 'gk0010', label: '工事受注入力 (GK0010)' },
        { key: 'gk0020', label: '工事予算入力 (GK0020)' },
        { key: 'gk0030', label: '工事台帳 (GK0030)' },
        { key: 'gk0110', label: '工事仕掛計算書 (GK0110)' },
        { key: 'gk0120', label: '工事一覧表 (GK0120)' },
        { key: 'gk0130', label: '工事別粗利管理表 (GK0130)' },
      ],
    },
    {
      key: 'sales',
      icon: <DollarOutlined />,
      label: '売上管理 (UR)',
      children: [
        { key: 'ur0010', label: '工事種目明細入力 (UR0010)' },
        { key: 'ur0120', label: '売上伝票リスト (UR0120)' },
      ],
    },
    {
      key: 'purchase',
      icon: <ShoppingCartOutlined />,
      label: '仕入管理 (SR)',
      children: [
        { key: 'sr0010', label: '仕入入力 (SR0010)' },
        { key: 'sr0110', label: '仕入先別工事別管理表 (SR0110)' },
        { key: 'sr0120', label: '仕入伝票リスト (SR0120)' },
      ],
    },
    {
      key: 'closing',
      icon: <SyncOutlined />,
      label: '月次更新 (VM)',
      children: [
        { key: 'vm0010', label: '月次更新処理 (VM0010)' },
        { key: 'vm0110', label: '更新履歴照会 (VM0110)' },
      ],
    },
    {
      key: 'master',
      icon: <SettingOutlined />,
      label: 'マスタ管理 (AD)',
      children: [
        { key: 'ad1780c', label: '受注先マスタ (AD1780C)' },
        { key: 'ad1790c', label: '仕入先マスタ (AD1790C)' },
        { key: 'ad1730c', label: 'ユーザーマスタ (AD1730C)' },
        { key: 'ad1720c', label: 'ユーザーグループ (AD1720C)' },
        { key: 'ad1760c', label: 'システム名称マスタ (AD1760C)' },
        { key: 'ad1770c', label: '処理基準管理マスタ (AD1770C)' },
      ],
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      {/* Sider Menu (AD1010C メニュー) */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        collapsedWidth={70}
        theme="dark"
        style={{
          boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)',
          zIndex: 10,
          background: '#141e28',
        }}
      >
        {/* Brand / Logo */}
        <div
          style={{
            height: 60,
            display: 'flex',
            alignItems: 'center',
            padding: collapsed ? '0 16px' : '0 20px',
            background: '#0d151d',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            transition: 'all 0.2s',
          }}
        >
          <Avatar
            shape="square"
            size={collapsed ? 36 : 32}
            style={{
              backgroundColor: '#1890ff',
              fontWeight: 800,
              fontSize: 16,
              borderRadius: 6,
              flexShrink: 0,
            }}
          >
            光
          </Avatar>
          {!collapsed && (
            <div style={{ marginLeft: 12, overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '0.04em' }}>
                （株）ミツヒデ
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 10 }}>原価管理 ERP システム</div>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          selectedKeys={[activeMenu]}
          defaultOpenKeys={['master', 'cost']}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => onSelectMenu(key)}
          style={{ background: '#141e28', borderRight: 0, paddingTop: 8 }}
        />
      </Sider>

      <Layout style={{ background: '#f5f7fa', flex: 1, minWidth: 0 }}>
        {/* Header */}
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e8e8e8',
            height: 60,
            lineHeight: '60px',
            position: 'sticky',
            top: 0,
            zIndex: 9,
            boxShadow: '0 1px 4px rgba(0, 21, 41, 0.04)',
          }}
        >
          {/* Left: Collapse Button & Title */}
          <Space size="middle">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 36, height: 36 }}
            />
            <span style={{ fontSize: 16, fontWeight: 700, color: '#172b3a' }}>
              工事原価・受注・売上・仕入管理システム
            </span>
            <Tag color="processing" style={{ borderRadius: 10, fontSize: 11 }}>
              稼働中
            </Tag>
          </Space>

          {/* Right: Date, Notifications & User Profile */}
          <Space size="large">
            <span style={{ color: '#595959', fontSize: 13, background: '#f5f5f5', padding: '4px 12px', borderRadius: 4 }}>
              📅 {dateStr}
            </span>

            <Tooltip title="通知">
              <Badge count={0} dot>
                <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 16 }} />} />
              </Badge>
            </Tooltip>

            <Space size="small" style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}>
              <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <div style={{ lineHeight: 1.2 }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#262626' }}>酒井 太郎</span>
                <span style={{ display: 'block', fontSize: 10, color: '#8c8c8c' }}>管理者 / 営業部</span>
              </div>
            </Space>
          </Space>
        </Header>

        {/* Page Content: Full width with smooth padding */}
        <Content
          style={{
            margin: '20px 24px',
            minHeight: 'calc(100vh - 145px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Content>

        <Footer
          style={{
            textAlign: 'center',
            color: '#8c8c8c',
            padding: '12px 24px',
            fontSize: 12,
            background: 'transparent',
            borderTop: '1px solid #ebebeb',
          }}
        >
          株式会社ミツヒデ 原価管理システム Web版 ©{today.getFullYear()} All Rights Reserved.
        </Footer>
      </Layout>
    </Layout>
  );
};
