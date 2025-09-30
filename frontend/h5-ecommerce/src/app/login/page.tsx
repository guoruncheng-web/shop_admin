'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/userSlice';
import { authAPI } from '@/services/api';
import styles from './login.module.scss';

// Simple Toast component
const showToast = (message: string) => {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 2000);
};

function LoginContent() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const redirectUrl = searchParams?.get('redirect') || '/';

  const doLogin = async () => {
    if (!phone || !password) {
      showToast('请输入手机号和密码');
      return;
    }
    setLoading(true);
    dispatch(loginStart());
    try {
      const res = await authAPI.login({ username: phone, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      dispatch(loginSuccess(res.data.user));
      showToast('登录成功!');
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      dispatch(loginFailure(err?.message || '登录失败'));
      showToast(err?.message || '登录失败');
      setLoading(false);
    }
  };

  const demoLogin = () => {
    const mockUser = {
      id: '1',
      username: phone || 'demo_user',
      email: `${phone || 'demo'}@example.com`,
      avatar: '/images/avatar.jpg',
    };
    const token = 'mock_token_' + Date.now();
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(mockUser));
    dispatch(loginSuccess(mockUser));
    showToast('演示登录成功');
    setTimeout(() => {
      router.push(redirectUrl);
    }, 1500);
  };


  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        {/* Decoration Elements */}
        <div className={`${styles.decorationCircle} ${styles.circle1}`}></div>
        <div className={`${styles.decorationCircle} ${styles.circle2}`}></div>

        {/* Header Section */}
        <div className={styles.loginHeader}>
          {/* <div className={styles.backBtn} onClick={handleBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div> */}
          <div className={styles.logo}>Elegance</div>
          <p className={styles.loginSubtitle}>欢迎回到高端时尚购物平台</p>
        </div>

        {/* Login Form */}
        <div className={styles.loginForm}>
          <h2 className={styles.welcomeText}>登录您的账号</h2>

          <div className={styles.inputGroup}>
            <label htmlFor="phone">手机号码</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H7V4h10v16z"/>
              </svg>
              <input
                type="tel"
                placeholder="请输入手机号码"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                id="phone"
                className={styles.customInput}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">密码</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              <input
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                className={styles.customInput}
              />
            </div>
          </div>

          <div className={styles.optionsRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>记住我</span>
            </label>
            <a href="#" className={styles.forgotPassword} onClick={(e) => { e.preventDefault(); showToast('功能开发中'); }}>
              忘记密码?
            </a>
          </div>

          <button
            onClick={doLogin}
            disabled={loading}
            className={styles.loginButton}
          >
            {loading ? '登录中...' : '登录'}
          </button>
          <div className={`${styles.formLoader} ${loading ? styles.active : ''}`}>
            <div className={styles.loaderProgress}></div>
          </div>

          <p className={styles.signupLink}>
            还没有账号? <a href="#" onClick={(e) => { e.preventDefault(); demoLogin(); }}>演示登录</a>
          </p>

          <div className={styles.socialLogin}>
            <div className={styles.divider}>使用其他方式登录</div>
            <div className={styles.socialIcons}>
              <div className={`${styles.socialIcon} ${styles.weixin}`} onClick={() => showToast('微信登录开发中')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.5 12c-.83 0-1.5-.67-1.5-1.5S7.67 9 8.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7 0c-.83 0-1.5-.67-1.5-1.5S14.67 9 15.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.12.23-2.18.65-3.15.42.48.87.92 1.35 1.32-.28.59-.43 1.24-.43 1.93 0 2.49 2.01 4.5 4.5 4.5.69 0 1.34-.15 1.93-.43.4.48.84.93 1.32 1.35-.97.42-2.03.65-3.15.65z"/>
                </svg>
              </div>
              <div className={`${styles.socialIcon} ${styles.qq}`} onClick={() => showToast('QQ登录开发中')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              </div>
              <div className={`${styles.socialIcon} ${styles.weibo}`} onClick={() => showToast('微博登录开发中')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.loginPage}><div>加载中...</div></div>}>
      <LoginContent />
    </Suspense>
  );
}