现在<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';

import { computed, onMounted, ref, watch } from 'vue';

import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
import { VBEN_DOC_URL, VBEN_GITHUB_URL } from '@vben/constants';
import { useWatermark } from '@vben/hooks';
import { BookOpenText, CircleHelp, MdiGithub } from '@vben/icons';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import { $t } from '#/locales';
import { useAuthStore } from '#/store';
import LoginForm from '#/views/_core/authentication/login.vue';
import { forceRefreshRoutes } from '#/utils/force-refresh-routes';
import '#/utils/force-menu-refresh';

const notifications = ref<NotificationItem[]>([
  {
    avatar: 'https://avatar.vercel.sh/vercel.svg?text=VB',
    date: '3小时前',
    isRead: true,
    message: '描述信息描述信息描述信息',
    title: '收到了 14 份新周报',
  },
  {
    avatar: 'https://avatar.vercel.sh/1',
    date: '刚刚',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '朱偏右 回复了你',
  },
  {
    avatar: 'https://avatar.vercel.sh/1',
    date: '2024-01-01',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '曲丽丽 评论了你',
  },
  {
    avatar: 'https://avatar.vercel.sh/satori',
    date: '1天前',
    isRead: false,
    message: '描述信息描述信息描述信息',
    title: '代办提醒',
  },
]);

const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();
const showDot = computed(() =>
  notifications.value.some((item) => !item.isRead),
);

const menus = computed(() => [
  {
    handler: () => {
      openWindow(VBEN_DOC_URL, {
        target: '_blank',
      });
    },
    icon: BookOpenText,
    text: $t('ui.widgets.document'),
  },
  {
    handler: () => {
      openWindow(VBEN_GITHUB_URL, {
        target: '_blank',
      });
    },
    icon: MdiGithub,
    text: 'GitHub',
  },
  {
    handler: () => {
      openWindow(`${VBEN_GITHUB_URL}/issues`, {
        target: '_blank',
      });
    },
    icon: CircleHelp,
    text: $t('ui.widgets.qa'),
  },
]);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await authStore.logout(false);
}

// 添加强制刷新菜单的方法
async function handleForceRefresh() {
  console.log('🔄 手动触发菜单刷新...');
  await forceRefreshRoutes();
}

// 页面加载时自动尝试刷新菜单
onMounted(async () => {
  console.log('🚀 页面加载完成，开始菜单检查流程...');
  
  // 多次检查，确保能捕获到正确的状态
  const checkAndRefreshMenus = async (attempt: number = 1) => {
    console.log(`🔍 第${attempt}次检查菜单状态...`);
    
    const accessStore = useAccessStore();
    const currentState = {
      isAccessChecked: accessStore.isAccessChecked,
      accessMenus: accessStore.accessMenus?.length || 0,
      accessToken: !!accessStore.accessToken,
      hasUserInfo: !!userStore.userInfo?.id
    };
    
    console.log('📊 当前状态:', currentState);
    
    // 检查是否需要刷新菜单
    const needsRefresh = currentState.accessToken && 
                        currentState.hasUserInfo && 
                        currentState.accessMenus < 3;
    
    // 强制刷新逻辑：如果是第1次检查且有用户信息，总是刷新
    const forceRefresh = attempt === 1 && currentState.accessToken && currentState.hasUserInfo;
    
    console.log('🤔 是否需要刷新菜单:', needsRefresh);
    console.log('🔥 是否强制刷新:', forceRefresh);
    
    if (needsRefresh || forceRefresh) {
      console.log('🔄 触发自动菜单刷新...');
      
      // 使用全局函数强制刷新
      if (typeof window !== 'undefined' && (window as any).forceRefreshMenus) {
        try {
          await (window as any).forceRefreshMenus();
          console.log('✅ 自动菜单刷新完成');
          return true;
        } catch (error) {
          console.error('❌ 自动菜单刷新失败:', error);
        }
      } else {
        console.warn('⚠️ 全局刷新函数不可用');
      }
    } else if (!currentState.accessToken) {
      console.log('ℹ️ 用户未登录，跳过菜单刷新');
    } else if (!currentState.hasUserInfo) {
      console.log('ℹ️ 用户信息未加载，跳过菜单刷新');
    } else {
      console.log('✅ 菜单状态正常，无需刷新');
    }
    
    return false;
  };
  
  // 立即尝试刷新（如果全局函数可用）
  setTimeout(async () => {
    if (typeof window !== 'undefined' && (window as any).forceRefreshMenus) {
      console.log('🚀 立即尝试强制刷新菜单...');
      try {
        await (window as any).forceRefreshMenus();
        console.log('✅ 立即刷新成功');
      } catch (error) {
        console.error('❌ 立即刷新失败:', error);
      }
    }
  }, 500);
  
  // 第一次检查（1秒后）
  setTimeout(() => checkAndRefreshMenus(1), 1000);
  
  // 第二次检查（3秒后）
  setTimeout(() => checkAndRefreshMenus(2), 3000);
  
  // 第三次检查（5秒后）
  setTimeout(async () => {
    const refreshed = await checkAndRefreshMenus(3);
    if (!refreshed) {
      console.log('🔚 菜单检查流程结束');
    }
  }, 5000);
});

function handleNoticeClear() {
  notifications.value = [];
}

function handleMakeAll() {
  notifications.value.forEach((item) => (item.isRead = true));
}
watch(
  () => preferences.app.watermark,
  async (enable) => {
    if (enable) {
      await updateWatermark({
        content: `${userStore.userInfo?.username} - ${userStore.userInfo?.realName}`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :menus
        :text="userStore.userInfo?.realName"
        description="ann.vben@gmail.com"
        tag-text="Pro"
        @logout="handleLogout"
      />
    </template>
    <template #notification>
      <Notification
        :dot="showDot"
        :notifications="notifications"
        @clear="handleNoticeClear"
        @make-all="handleMakeAll"
      />
    </template>
    <template #extra>
      <AuthenticationLoginExpiredModal
        v-model:open="accessStore.loginExpired"
        :avatar
      >
        <LoginForm />
      </AuthenticationLoginExpiredModal>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>
