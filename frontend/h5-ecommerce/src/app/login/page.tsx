'use client';

import React, { useState } from 'react';
import { Button, Card, Input, Space, Toast } from 'antd-mobile';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/userSlice';
import { authAPI } from '@/services/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const redirectUrl = searchParams?.get('redirect') || '/';

  const doLogin = async () => {
    if (!username || !password) {
      Toast.show('请输入用户名和密码');
      return;
    }
    setLoading(true);
    dispatch(loginStart());
    try {
      const res = await authAPI.login({ username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      dispatch(loginSuccess(res.data.user));
      Toast.show('登录成功');
      router.push(redirectUrl);
    } catch (err: any) {
      console.error(err);
      dispatch(loginFailure(err?.message || '登录失败'));
      Toast.show(err?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = () => {
    const mockUser = {
      id: '1',
      username: username || 'demo_user',
      email: `${username || 'demo'}@example.com`,
      avatar: '/images/avatar.jpg',
    };
    const token = 'mock_token_' + Date.now();
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(mockUser));
    dispatch(loginSuccess(mockUser));
    Toast.show('演示登录成功');
    router.push(redirectUrl);
  };

  return (
    <div style={{ minHeight: '100vh', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
      <Card style={{ width: '100%', maxWidth: 420 }}>
        <h2 style={{ marginBottom: 16 }}>用户登录</h2>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input placeholder="用户名" value={username} onChange={setUsername} clearable />
          <Input placeholder="密码" type="password" value={password} onChange={setPassword} clearable />
          <Button color="primary" block loading={loading} onClick={doLogin}>登录</Button>
          <Button block onClick={demoLogin}>演示登录（本地模拟）</Button>
        </Space>
      </Card>
    </div>
  );
}