import React, { useState } from 'react';
import { Layout, Menu, Typography, Space, Avatar, Badge, Tag } from 'antd';
import {
  HomeOutlined,
  ProjectOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  SyncOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header, Content, Sider, Footer } = Layout;
const { Title, Text } = Typography;

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
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sider Menu (AD1010C メニュー) */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={260}
        theme="dark"
        style={{
          boxShadow: '2px 0 8px rgba(0,21,41,.15)',
        }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#001529' }}>
          <Space>
            <Avatar shape="square" size="small" style={{ backgroundColor: '#1890ff', fontWeight: 'bold' }}>
              光
            </Avatar>
            {!collapsed && (
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 15, letterSpacing: '0.05em' }}>
                （株）ミツヒデ 原価
              </span>
            )}
          </Space>
        </div>
        <Menu
          theme="dark"
          selectedKeys={[activeMenu]}
          defaultOpenKeys={['master', 'cost']}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => onSelectMenu(key)}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
            height: 56,
          }}
        >
          <Space>
            <Title level={5} style={{ margin: 0, color: '#172b3a' }}>
              工事原価・受注・売上・仕入管理システム
            </Title>
            <Tag color="cyan">Web Edition v1.0</Tag>
          </Space>

          <Space size="large">
            <Text type="secondary" style={{ fontSize: 13 }}>
              {dateStr}
            </Text>
            <Space>
              <Badge status="success" />
              <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <Text strong style={{ fontSize: 13 }}>
                システム管理者 (酒井)
              </Text>
            </Space>
          </Space>
        </Header>

        {/* Page Content */}
        <Content style={{ margin: '16px 20px', minHeight: 280 }}>
          {children}
        </Content>

        <Footer style={{ textAlign: 'center', color: '#888', padding: '12px 50px', fontSize: 12 }}>
          株式会社ミツヒデ 原価管理システム ©{today.getFullYear()} All Rights Reserved.
        </Footer>
      </Layout>
    </Layout>
  );
};
