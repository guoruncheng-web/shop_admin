<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { computed, onMounted, ref, h } from 'vue';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { getCaptchaApi } from '#/api/core/auth';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();

const captchaImage = ref('');
const captchaId = ref('');
const loadingCaptcha = ref(false);

async function fetchCaptcha() {
  try {
    loadingCaptcha.value = true;
    const res = await getCaptchaApi();
    if (res) {
      captchaId.value = res.captchaId;
      captchaImage.value = res.captchaImage;
    }
  } catch (err) {
    // 可根据需要添加错误提示
    console.error('获取验证码失败:', err);
  } finally {
    loadingCaptcha.value = false;
  }
}

const refreshCaptcha = () => {
  fetchCaptcha();
};

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: '请输入验证码',
      },
      fieldName: 'captcha',
      label: '验证码',
      rules: z.string().min(4, { message: '请输入正确的验证码' }),
      // 将验证码图片放到输入框后缀区域
      suffix: () =>
        h(
          'div',
          { class: 'flex items-center gap-2 h-full' },
          [
            captchaImage.value
              ? h('img', {
                  src: captchaImage.value,
                  alt: '验证码',
                  class: 'h-full max-h-full w-auto object-contain cursor-pointer rounded border',
                  onClick: refreshCaptcha,
                })
              : h(
                  'span',
                  { class: 'text-muted-foreground text-sm cursor-pointer', onClick: refreshCaptcha },
                  loadingCaptcha.value ? '加载中…' : '点击获取',
                ),
          ],
        ),
    },
  ];
});

onMounted(() => {
  fetchCaptcha();
});
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    :show-code-login="false"
    :show-qrcode-login="false"
    :show-register="false"
    :show-forget-password="false"
    :show-third-party-login="false"
    @submit="(data) => authStore.authLogin({ ...data, captchaId })"
  />
</template>
