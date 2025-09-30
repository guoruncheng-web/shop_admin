'use client';

import React, { useEffect, useMemo, useState } from 'react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);

  // 倒计时计时器
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const canSendCode = useMemo(() => {
    return !sending && seconds === 0 && phone.length === 11;
  }, [sending, seconds, phone]);

  const sendCode = () => {
    if (!phone || phone.length < 11) {
      alert('请输入正确的手机号码');
      return;
    }
    setSending(true);
    // 模拟请求
    setTimeout(() => {
      setSending(false);
      setSeconds(60);
    }, 600);
  };

  const handleLogin = () => {
    if (!phone || phone.length < 11) {
      alert('请输入正确的手机号码');
      return;
    }
    if (!code || code.length < 4) {
      alert('请输入有效的验证码');
      return;
    }
    setLoading(true);
    // 模拟登录
    setTimeout(() => {
      try {
        localStorage.setItem('token', 'mock-token-' + Date.now());
      } catch {}
      setLoading(false);
      alert('登录成功！');
      window.location.href = '/';
    }, 1200);
  };

  // 限制输入为数字
  const onPhoneInput = (v: string) => setPhone(v.replace(/[^\d]/g, '').slice(0, 11));
  const onCodeInput = (v: string) => setCode(v.replace(/[^\d]/g, '').slice(0, 6));

  return (
    <div
      style={{
        background: '#f8f9fa',
        minHeight: '100vh',
        padding: 0,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 0,
          boxShadow: 'none',
          width: '100%',
          maxWidth: '100%',
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* 头部 */}
        <div
          style={{
            background: 'linear-gradient(to right, #e29692, #c57d7a)',
            padding: 24,
            textAlign: 'center' as const,
            color: '#fff',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: -80,
              right: -80,
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: -40,
              left: -40,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
            }}
          />
          <div
            style={{
              width: 90,
              height: 90,
              background: '#fff',
              borderRadius: '50%',
              margin: '0 auto 12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            }}
          >
            <span style={{ fontSize: '2.5rem', color: '#e29692' }}>🛍️</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: 0.5 }}>StyleHub</div>
          <div style={{ marginTop: 8, opacity: 0.9 }}>时尚购物，随时随地</div>
        </div>

        {/* 表单 */}
        <div style={{ padding: '24px 20px 20px' }}>
          {/* 手机号 */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#333' }}>手机号码</label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: 15,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666',
                }}
              >
                📱
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => onPhoneInput(e.target.value)}
                placeholder="请输入您的手机号码"
                maxLength={11}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 45px',
                  border: '1px solid #e0e0e0',
                  borderRadius: 12,
                  fontSize: '1rem',
                  transition: 'all 0.3s',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#e29692';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(226,150,146,0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* 验证码 */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#333' }}>验证码</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ position: 'relative', flexGrow: 1 }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 15,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#666',
                  }}
                >
                  🛡️
                </span>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => onCodeInput(e.target.value)}
                  placeholder="请输入验证码"
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 45px',
                    border: '1px solid #e0e0e0',
                    borderRadius: 12,
                    fontSize: '1rem',
                    transition: 'all 0.3s',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#e29692';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(226,150,146,0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                onClick={sendCode}
                disabled={!canSendCode}
                style={{
                  background: canSendCode ? '#f9f0ef' : '#eee',
                  color: canSendCode ? '#e29692' : '#999',
                  border: 'none',
                  borderRadius: 12,
                  padding: '0 16px',
                  fontWeight: 500,
                  cursor: canSendCode ? 'pointer' : 'not-allowed',
                  whiteSpace: 'nowrap' as const,
                  minWidth: 120,
                }}
              >
                {seconds > 0 ? `${seconds}秒后重新发送` : sending ? '发送中...' : '获取验证码'}
              </button>
            </div>
          </div>

          {/* 登录按钮 */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(to right, #e29692, #c57d7a)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: 12,
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s',
              marginTop: 10,
              boxShadow: loading ? 'none' : '0 5px 15px rgba(226, 150, 146, 0.4)',
            }}
          >
            {loading ? '登录中...' : '立即登录'}
          </button>

          {/* 分隔与其他登录 */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
            <div style={{ flexGrow: 1, height: 1, background: '#e0e0e0' }} />
            <div style={{ padding: '0 12px', color: '#666', fontSize: '0.9rem' }}>其他登录方式</div>
            <div style={{ flexGrow: 1, height: 1, background: '#e0e0e0' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: '#f9f9f9',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.3s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'none')}
            >
              <span style={{ fontSize: '1.5rem', color: '#09bb07' }}>🟢</span>
            </div>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: '#f9f9f9',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.3s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'none')}
            >
              <span style={{ fontSize: '1.5rem', color: '#108ee9' }}>🔵</span>
            </div>
          </div>

          {/* 底部链接 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 16,
              marginTop: 24,
              fontSize: '0.9rem',
            }}
          >
            {['用户协议', '隐私政策', '帮助中心'].map((t, i) => (
              <a
                key={t}
                href="#"
                style={{
                  color: '#666',
                  textDecoration: 'none',
                  position: 'relative',
                  padding: '0 8px',
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#e29692')}
                onMouseOut={(e) => (e.currentTarget.style.color = '#666')}
              >
                {t}
                {i !== 2 ? (
                  <span
                    style={{
                      position: 'absolute',
                      right: -10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: 12,
                      width: 1,
                      background: '#e0e0e0',
                    }}
                  />
                ) : null}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}