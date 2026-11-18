import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Typography, Button, Space, Progress } from 'antd';
import { ClockCircleOutlined, LogoutOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Text, Paragraph } = Typography;

// Standard Enterprise Settings:
// 30 minutes total idle timeout, warning triggered 2 minutes before logout
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes (120 seconds)

export const SessionTimeoutWatcher: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(120);

  const lastActivityRef = useRef<number>(Date.now());
  const isWarningOpenRef = useRef<boolean>(false);

  // Sync ref
  useEffect(() => {
    isWarningOpenRef.current = isWarningOpen;
  }, [isWarningOpen]);

  // Reset activity timestamp on user interaction
  const resetActivity = useCallback(() => {
    // If warning modal is already shown, don't silently dismiss on simple mouse moves;
    // user must explicitly click "Continue" button on the modal.
    if (!isWarningOpenRef.current) {
      lastActivityRef.current = Date.now();
    }
  }, []);

  // Explicit user confirmation to stay logged in
  const handleStayLoggedIn = () => {
    lastActivityRef.current = Date.now();
    setIsWarningOpen(false);
  };

  // Immediate logout from dialog
  const handleImmediateLogout = () => {
    setIsWarningOpen(false);
    logout();
  };

  // Setup event listeners for user activity
  useEffect(() => {
    // Reset all activity tracking and modal states whenever auth state changes
    lastActivityRef.current = Date.now();
    isWarningOpenRef.current = false;
    setIsWarningOpen(false);
    setRemainingSeconds(120);

    if (!isAuthenticated) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    let throttleTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleUserEvent = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          resetActivity();
          throttleTimeout = null;
        }, 1000); // Throttled to once per second for performance
      }
    };

    events.forEach((evt) => window.addEventListener(evt, handleUserEvent, { passive: true }));

    // Heartbeat ticker running every 1 second
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;
      const timeLeftMs = IDLE_TIMEOUT_MS - elapsed;

      // 1. Time fully expired -> Auto Logout
      if (timeLeftMs <= 0) {
        clearInterval(interval);
        lastActivityRef.current = Date.now();
        setIsWarningOpen(false);
        isWarningOpenRef.current = false;
        Modal.destroyAll();
        logout();
        Modal.warning({
          title: 'セッション有効期限切れ',
          content: '一定時間操作が行われなかったため、セキュリティ保護のため自動ログアウトしました。再度ログインしてください。',
          okText: 'ログイン画面へ',
        });
        return;
      }

      // 2. Approaching expiration -> Show countdown warning
      if (timeLeftMs <= WARNING_THRESHOLD_MS) {
        setIsWarningOpen(true);
        setRemainingSeconds(Math.max(0, Math.ceil(timeLeftMs / 1000)));
      } else {
        if (isWarningOpenRef.current) {
          setIsWarningOpen(false);
        }
      }
    }, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserEvent));
      clearInterval(interval);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [isAuthenticated, logout, resetActivity]);

  if (!isAuthenticated) return null;

  // Format countdown mm:ss
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  const percentLeft = Math.round((remainingSeconds / 120) * 100);

  return (
    <Modal
      open={isWarningOpen}
      closable={false}
      maskClosable={false}
      centered
      width={440}
      title={
        <Space align="center">
          <ClockCircleOutlined style={{ color: '#f59e0b', fontSize: 20 }} />
          <Text strong style={{ fontSize: 16 }}>
            セッションタイムアウト警告
          </Text>
        </Space>
      }
      footer={[
        <Button key="logout" danger icon={<LogoutOutlined />} onClick={handleImmediateLogout}>
          ログアウト
        </Button>,
        <Button
          key="stay"
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={handleStayLoggedIn}
          style={{ background: '#2563eb', borderColor: '#2563eb' }}
        >
          セッションを継続する
        </Button>,
      ]}
    >
      <div style={{ padding: '12px 0 8px 0', textAlign: 'center' }}>
        <Paragraph style={{ color: '#475569', fontSize: 14 }}>
          操作が一定時間行われていません。
          <br />
          セキュリティ保護のため、まもなく自動的にログアウトされます。
        </Paragraph>

        <div style={{ margin: '16px 0' }}>
          <Text style={{ fontSize: 32, fontWeight: 700, color: remainingSeconds < 30 ? '#ef4444' : '#f59e0b' }}>
            {timeFormatted}
          </Text>
          <div style={{ width: '80%', margin: '8px auto 0 auto' }}>
            <Progress
              percent={percentLeft}
              showInfo={false}
              status={remainingSeconds < 30 ? 'exception' : 'active'}
              strokeColor={remainingSeconds < 30 ? '#ef4444' : '#f59e0b'}
            />
          </div>
        </div>

        <Text type="secondary" style={{ fontSize: 12 }}>
          作業を継続する場合は「セッションを継続する」をクリックしてください。
        </Text>
      </div>
    </Modal>
  );
};
