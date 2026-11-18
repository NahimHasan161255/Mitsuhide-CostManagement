import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Modal, message, Space } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, KeyOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useDeviceType } from '../../hooks/useDeviceType';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const { isMobile } = useDeviceType();
  const { login, changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password Change Modal
  const [isPwModalOpen, setIsPwModalOpen] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwForm] = Form.useForm();
  const [loginForm] = Form.useForm();

  // Handle Login
  const handleLogin = async (values: { userCd: string; password: string }) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await login(values.userCd, values.password);
      if (res.success) {
        message.success(res.message);

        // 1. 月次更新チェック (AD1010C仕様 5)
        if (res.monthlyClosingWarning) {
          Modal.warning({
            title: '月次更新確認 (AD1010C)',
            content: res.monthlyClosingWarning,
            okText: '確認',
          });
        }

        // 2. パスワード有効期限チェック (AD1010C仕様 3)
        if (res.passwordExpired) {
          Modal.info({
            title: 'パスワード有効期限警告 (AD1010C)',
            content: res.passwordExpiredMessage || 'パスワードの有効期限が切れています。',
            okText: 'パスワードを変更する',
            cancelText: '後で',
            onOk: () => {
              setIsPwModalOpen(true);
            },
          });
        }
      } else {
        setErrorMessage(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async () => {
    try {
      const values = await pwForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error('新しいパスワードと確認用パスワードが一致しません。');
        return;
      }

      setPwLoading(true);
      const res = await changePassword(values.oldPassword, values.newPassword);
      if (res.success) {
        message.success(res.message);
        setIsPwModalOpen(false);
        pwForm.resetFields();
      } else {
        message.error(res.message);
      }
    } catch {
      // Form validation failed
    } finally {
      setPwLoading(false);
    }
  };

  // Keyboard shortcut listener for F1 (Login) and F10 (Password Change)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        loginForm.submit();
      } else if (e.key === 'F10') {
        e.preventDefault();
        setIsPwModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loginForm]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
        padding: '16px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        styles={{ body: { padding: isMobile ? '24px 20px' : '36px 32px' } }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: '0 auto 12px auto',
              background: '#2563eb',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 26,
              boxShadow: '0 8px 16px rgba(37,99,235,0.35)',
            }}
          >
            <SafetyCertificateOutlined />
          </div>
          <Title level={3} style={{ margin: 0, fontWeight: 700, letterSpacing: '0.5px' }}>
            株式会社ミツヒデ
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            工事管理システム ログオン (AD1010C)
          </Text>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <Alert
            message={errorMessage}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMessage(null)}
            style={{ marginBottom: 20 }}
          />
        )}

        {/* Login Form */}
        <Form
          form={loginForm}
          layout="vertical"
          size="large"
          onFinish={handleLogin}
          autoComplete="off"
        >
          <Form.Item
            label={<Text strong>社員コード (ユーザID)</Text>}
            name="userCd"
            rules={[
              { required: true, message: '社員コードを入力してください' },
              { max: 6, message: '最大6桁です' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
              placeholder="例: 000001"
              maxLength={6}
              autoComplete="off"
              autoFocus
            />
          </Form.Item>

          <Form.Item
            label={<Text strong>パスワード</Text>}
            name="password"
            rules={[{ required: true, message: 'パスワードを入力してください' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
              placeholder="パスワードを入力"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<LoginOutlined />}
              loading={loading}
              block
              style={{
                height: 46,
                fontWeight: 600,
                fontSize: 15,
                background: '#2563eb',
                borderColor: '#2563eb',
              }}
            >
              ログイン<span className="erp-btn-shortcut"> (F1)</span>
            </Button>
          </Form.Item>
        </Form>

        {/* Password change shortcut */}
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Button
            type="link"
            size="small"
            icon={<KeyOutlined />}
            onClick={() => setIsPwModalOpen(true)}
            style={{ color: '#64748b' }}
          >
            パスワード変更<span className="erp-btn-shortcut"> (F10)</span>
          </Button>
        </div>
      </Card>

      {/* Password Change Modal (AD1010C - F10) */}
      <Modal
        title={
          <Space>
            <KeyOutlined style={{ color: '#2563eb' }} />
            <span>パスワード変更 (F10)</span>
          </Space>
        }
        open={isPwModalOpen}
        onOk={handleChangePassword}
        onCancel={() => {
          setIsPwModalOpen(false);
          pwForm.resetFields();
        }}
        confirmLoading={pwLoading}
        okText="変更する"
        cancelText="キャンセル"
        width={440}
      >
        <Form form={pwForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="現在のパスワード"
            name="oldPassword"
            rules={[{ required: true, message: '現在のパスワードを入力してください' }]}
          >
            <Input.Password placeholder="現在のパスワード" />
          </Form.Item>

          <Form.Item
            label="新しいパスワード"
            name="newPassword"
            rules={[
              { required: true, message: '新しいパスワードを入力してください' },
              { min: 4, message: '4文字以上で入力してください' },
            ]}
          >
            <Input.Password placeholder="新しいパスワード (4文字以上)" />
          </Form.Item>

          <Form.Item
            label="新しいパスワード (確認用)"
            name="confirmPassword"
            rules={[{ required: true, message: '確認用パスワードを入力してください' }]}
          >
            <Input.Password placeholder="新しいパスワードを再入力" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
