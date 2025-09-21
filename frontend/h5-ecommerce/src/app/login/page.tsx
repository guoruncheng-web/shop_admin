'use client';

import { useState } from 'react';
import { Button, Form, Input, Toast, Space, Divider } from 'antd-mobile';
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface LoginFormData {
  phone: string;
  code: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [visible, setVisible] = useState(false);

  // 发送验证码
  const handleSendCode = async () => {
    const phone = form.getFieldValue('phone');
    
    if (!phone) {
      Toast.show({
        icon: 'fail',
        content: '请输入手机号',
      });
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      Toast.show({
        icon: 'fail',
        content: '请输入正确的手机号',
      });
      return;
    }

    // 开始倒计时
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 模拟发送验证码
    Toast.show({
      icon: 'success',
      content: '验证码已发送',
    });

    // TODO: 调用实际的发送验证码API
    console.log('发送验证码到:', phone);
  };

  // 登录处理
  const handleLogin = async (values: LoginFormData) => {
    setLoading(true);
    
    try {
      // 模拟登录请求
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: 调用实际的登录API
      console.log('登录数据:', values);
      
      Toast.show({
        icon: 'success',
        content: '登录成功',
      });
      
      // 登录成功后跳转
      setTimeout(() => {
        router.push('/');
      }, 1000);
      
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: '登录失败，请重试',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 简洁的顶部标题 */}
      <div className={styles.header}>
        <h1 className={styles.title}>登录</h1>
        <p className={styles.subtitle}>请输入手机号和验证码</p>
      </div>

      {/* 登录表单 */}
      <div className={styles.formContainer}>
        <div className={styles.formCard}>
          <Form
            form={form}
            onFinish={handleLogin}
            footer={null}
            layout="vertical"
          >
            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
              ]}
            >
              <Input
                placeholder="请输入手机号"
                maxLength={11}
                className={styles.input}
              />
            </Form.Item>

            <Form.Item
              name="code"
              label="验证码"
              rules={[
                { required: true, message: '请输入验证码' },
                { len: 6, message: '验证码为6位数字' }
              ]}
              extra={
                <Button
                  size="small"
                  color="primary"
                  fill="none"
                  disabled={countdown > 0}
                  onClick={handleSendCode}
                  className={styles.codeButton}
                >
                  {countdown > 0 ? `${countdown}s后重发` : '获取验证码'}
                </Button>
              }
            >
              <Input
                placeholder="请输入6位验证码"
                maxLength={6}
                className={styles.input}
              />
            </Form.Item>

            <Form.Item className={styles.submitContainer}>
              <Button
                type="submit"
                color="primary"
                size="large"
                block
                loading={loading}
                className={styles.submitButton}
              >
                {loading ? '登录中...' : '立即登录'}
              </Button>
            </Form.Item>
          </Form>

          {/* 其他登录方式 */}
          <div className={styles.otherLogin}>
            <Divider className={styles.divider}>其他登录方式</Divider>
            <div className={styles.socialLogin}>
              <div className={styles.socialItem}>
                <span className={styles.socialIcon}>📱</span>
                <span>微信登录</span>
              </div>
            </div>
          </div>

          {/* 底部链接 */}
          <div className={styles.footer}>
            <div className={styles.footerLinks}>
              <span>还没有账号？</span>
              <Link href="/register" className={styles.link}>
                立即注册
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}