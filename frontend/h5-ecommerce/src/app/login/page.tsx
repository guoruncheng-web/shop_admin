'use client';

import React, { useState } from 'react';
import { Input, Button, Checkbox, Toast } from 'antd-mobile';
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons';
import styles from './page.module.css';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleLogin = async () => {
    if (!agreed) {
      Toast.show('请先同意用户协议');
      return;
    }

    if (!phone) {
      Toast.show('请输入用户名');
      return;
    }

    if (!password) {
      Toast.show('请输入密码');
      return;
    }

    // 模拟登录
    Toast.show('登录成功');
  };

  const handleThirdPartyLogin = (type: string) => {
    Toast.show(`${type}登录功能开发中`);
  };

  return (
    <div className={styles.container}>
      {/* 品牌区域 */}
      <div className={styles.brandSection}>
        <div className={styles.logo}>
          <div className={styles.logoContainer}>
            <img 
              src="/logo.png" 
              alt="电商平台Logo" 
              className={styles.logoImage}
            />
          </div>
          <div className={styles.logoText}>精品商城</div>
          <div className={styles.slogan}>品 质 生 活</div>
        </div>
        <div className={styles.features}>
          <span>🛡️ 100%正品</span>
          <span>📦 顺丰配送</span>
          <span>🔄 退换无忧</span>
        </div>
      </div>

      {/* 登录表单 */}
      <div className={styles.loginForm}>
        <div className={styles.inputGroup}>
          <Input
            placeholder="用户名/绑定手机/绑定邮箱"
            value={phone}
            onChange={setPhone}
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <div style={{ position: 'relative' }}>
            <Input
              placeholder="登录密码"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              className={styles.input}
            />
            <div 
              onClick={() => setShowPassword(!showPassword)} 
              style={{ 
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer', 
                color: '#ccc',
                zIndex: 1
              }}
            >
              {showPassword ? <EyeOutline /> : <EyeInvisibleOutline />}
            </div>
          </div>
        </div>

        <Button
          block
          color="primary"
          size="large"
          className={styles.loginButton}
          onClick={handleLogin}
        >
          登录
        </Button>

        <div className={styles.agreement}>
          <Checkbox
            checked={agreed}
            onChange={setAgreed}
          >
            我已阅读并同意 <a href="#" className={styles.link}>《唯品会服务条款》</a>《<a href="#" className={styles.link}>唯品会基本功能隐私政策</a>》
          </Checkbox>
        </div>
      </div>

      {/* 底部登录方式 */}
      <div className={styles.bottomActions}>
        <div className={styles.otherLogin}>
          <span 
            className={styles.loginMethod}
            onClick={() => handleThirdPartyLogin('微信')}
          >
            微信登录
          </span>
          <span className={styles.separator}>|</span>
          <span 
            className={styles.loginMethod}
            onClick={() => handleThirdPartyLogin('手机')}
          >
            手机登录
          </span>
        </div>
      </div>
    </div>
  );
}