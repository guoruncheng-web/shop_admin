'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileSetupPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);

  // 预设头像列表
  const avatarOptions = [
    '👨', '👩', '🧑', '👦', '👧',
    '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '🧑‍💻',
    '👨‍🎨', '👩‍🎨', '🧑‍🍳', '👨‍🔧', '👩‍⚕️',
  ];

  const handleSubmit = () => {
    if (!nickname || nickname.trim().length === 0) {
      alert('请输入昵称');
      return;
    }
    if (!gender) {
      alert('请选择性别');
      return;
    }
    if (!avatar) {
      alert('请选择头像');
      return;
    }

    setLoading(true);
    // 模拟保存用户信息
    setTimeout(() => {
      try {
        // 保存用户信息到 localStorage
        const userInfo = {
          nickname,
          gender,
          avatar,
          isFirstLogin: false,
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      } catch {}
      setLoading(false);
      alert('设置成功！');
      // 跳转到首页
      router.replace('/');
    }, 1000);
  };

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
          minHeight: '100vh',
          overflow: 'auto',
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
            <span style={{ fontSize: '2.5rem', color: '#e29692' }}>✨</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: 0.5 }}>完善个人信息</div>
          <div style={{ marginTop: 8, opacity: 0.9 }}>让我们更好地了解您</div>
        </div>

        {/* 表单 */}
        <div style={{ padding: '24px 20px 20px' }}>
          {/* 昵称 */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#333' }}>昵称</label>
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
                👤
              </span>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="请输入您的昵称"
                maxLength={20}
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

          {/* 性别 */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 12, fontWeight: 500, color: '#333' }}>性别</label>
            <div style={{ display: 'flex', gap: 16 }}>
              <div
                onClick={() => setGender('male')}
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  border: `2px solid ${gender === 'male' ? '#e29692' : '#e0e0e0'}`,
                  borderRadius: 12,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  background: gender === 'male' ? '#f9f0ef' : '#fff',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>👨</div>
                <div style={{ color: gender === 'male' ? '#e29692' : '#666', fontWeight: 500 }}>男</div>
              </div>
              <div
                onClick={() => setGender('female')}
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  border: `2px solid ${gender === 'female' ? '#e29692' : '#e0e0e0'}`,
                  borderRadius: 12,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  background: gender === 'female' ? '#f9f0ef' : '#fff',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>👩</div>
                <div style={{ color: gender === 'female' ? '#e29692' : '#666', fontWeight: 500 }}>女</div>
              </div>
            </div>
          </div>

          {/* 头像选择 */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 12, fontWeight: 500, color: '#333' }}>选择头像</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 12,
              }}
            >
              {avatarOptions.map((av) => (
                <div
                  key={av}
                  onClick={() => setAvatar(av)}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    border: `2px solid ${avatar === av ? '#e29692' : '#e0e0e0'}`,
                    borderRadius: 12,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    background: avatar === av ? '#f9f0ef' : '#fff',
                    fontSize: '2rem',
                  }}
                >
                  {av}
                </div>
              ))}
            </div>
          </div>

          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
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
            {loading ? '保存中...' : '完成设置'}
          </button>

          {/* 提示文字 */}
          <div
            style={{
              textAlign: 'center',
              marginTop: 16,
              fontSize: '0.85rem',
              color: '#999',
            }}
          >
            这些信息将帮助我们为您提供更好的服务
          </div>
        </div>
      </div>
    </div>
  );
}
