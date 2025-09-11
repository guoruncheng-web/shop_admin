import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';
import { useUserStore } from '@vben/stores';

/**
 * 获取用户详细信息
 */
export async function getProfile() {
  const userInfo = await requestClient.get<UserInfo>('/api/auth/profile');
  
  // 将用户信息保存到 Pinia store
  const userStore = useUserStore();
  userStore.setUserInfo(userInfo);
  
  return userInfo;
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  // 调用getProfile获取用户信息并保存到store
  const userInfo = await getProfile();
  return userInfo;
}
