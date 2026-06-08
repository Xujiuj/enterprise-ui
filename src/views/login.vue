<template>
  <div class="login-page auth-page">
    <div class="login-brand">
      <span class="logo-mark"></span>
      <span>企业碳数据管理平台</span>
    </div>
    <span class="portal-tag">企业端</span>

    <div class="login-box">
      <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-card">
        <h2>企业碳数据管理平台</h2>

        <el-form-item prop="username" label="账号" class="field">
          <el-input v-model="loginForm.username" autocomplete="username" placeholder="请输入账号" />
        </el-form-item>

        <el-form-item prop="password" label="密码" class="field">
          <el-input
            v-model="loginForm.password"
            type="password"
            autocomplete="current-password"
            placeholder="请输入密码"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="code" label="图形验证码" class="field">
          <div class="captcha-field">
            <el-input v-model="loginForm.code" autocomplete="off" placeholder="请输入验证码" @keyup.enter="handleLogin" />
            <button type="button" class="captcha-img" aria-label="刷新验证码" @click="getCode">
              <img v-if="codeUrl" :src="codeUrl" alt="验证码" />
              <span v-else>8A21</span>
            </button>
          </div>
        </el-form-item>

        <el-button :loading="loading" type="primary" class="btn primary login-submit" @click.prevent="handleLogin">
          <span v-if="!loading">登录</span>
          <span v-else>校验中...</span>
        </el-button>

        <div class="login-support">
          <span>企业私有化部署</span>
          <span>授权到期请联系本企业系统管理员</span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCodeImg } from '@/api/login';
import { useUserStore } from '@/store/modules/user';
import { LoginData } from '@/api/types';
import { to } from 'await-to-js';
import { useI18n } from 'vue-i18n';

const userStore = useUserStore();
const router = useRouter();
const { t } = useI18n();

const loginForm = ref<LoginData>({
  tenantId: '000000',
  username: 'admin',
  password: 'admin123',
  rememberMe: false,
  code: '',
  uuid: ''
} as LoginData);

const loginRules: ElFormRules = {
  username: [{ required: true, trigger: 'blur', message: t('login.rule.username.required') }],
  password: [{ required: true, trigger: 'blur', message: t('login.rule.password.required') }],
  code: [{ required: true, trigger: 'change', message: t('login.rule.code.required') }]
};

const codeUrl = ref('');
const loading = ref(false);
const captchaEnabled = ref(true);
const redirect = ref('/');
const loginRef = ref<ElFormInstance>();

watch(
  () => router.currentRoute.value,
  (newRoute: any) => {
    redirect.value = newRoute.query && newRoute.query.redirect && decodeURIComponent(newRoute.query.redirect);
  },
  { immediate: true }
);

const handleLogin = () => {
  loginRef.value?.validate(async (valid: boolean, fields: any) => {
    if (!valid) {
      console.log('error submit!', fields);
      return;
    }

    loading.value = true;
    loginForm.value.tenantId = '000000';
    const [err] = await to(userStore.login(loginForm.value));
    if (!err) {
      const redirectUrl = redirect.value || '/';
      await router.push(redirectUrl);
      loading.value = false;
      return;
    }

    loading.value = false;
    if (captchaEnabled.value) {
      await getCode();
    }
  });
};

const getCode = async () => {
  const res = await getCodeImg();
  const { data } = res;
  captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled;
  if (captchaEnabled.value) {
    loginForm.value.code = '';
    codeUrl.value = 'data:image/gif;base64,' + data.img;
    loginForm.value.uuid = data.uuid;
  }
};

onMounted(() => {
  getCode();
});
</script>

<style lang="scss" scoped>
.auth-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background:
    linear-gradient(90deg, rgba(16, 40, 32, 0.74), rgba(24, 52, 47, 0.42) 48%, rgba(255, 255, 255, 0.08)),
    url('../assets/images/login-carbon-bg.png') center / cover no-repeat;
}

.login-brand,
.portal-tag {
  position: fixed;
  top: 48px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  color: #fff;
  pointer-events: auto;
}

.login-brand {
  left: 48px;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.logo-mark {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0) 44%), linear-gradient(135deg, #22c55e, #1677ff);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
}

.portal-tag {
  right: 48px;
  height: 32px;
  gap: 6px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(12px);
}

.portal-tag::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.login-box {
  position: relative;
  z-index: 1;
  width: min(430px, calc(100vw - 48px));
}

.login-card {
  width: 100%;
  padding: 36px 32px 26px;
  border: 1px solid rgba(255, 255, 255, 0.48);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 28px 70px rgba(8, 24, 42, 0.28);
  backdrop-filter: blur(16px);
}

.login-card h2 {
  margin: 0 0 20px;
  color: var(--carbon-ink);
  font-size: 20px;
  font-weight: 700;
  text-align: center;
}

.field {
  margin-bottom: 12px;
}

.login-card :deep(.el-form-item) {
  display: block;
}

.login-card :deep(.el-form-item__label) {
  justify-content: flex-start;
  height: auto;
  margin-bottom: 6px;
  color: var(--carbon-text);
  font-weight: 500;
  line-height: 1.5;
}

.login-card :deep(.el-input__wrapper) {
  min-height: 36px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 0 0 1px #d6dce5 inset;
}

.login-card :deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px var(--carbon-primary) inset,
    0 0 0 3px rgba(22, 119, 255, 0.12);
}

.captcha-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 104px;
  gap: 8px;
}

.captcha-img {
  height: 36px;
  border: 1px solid #b9d9ca;
  border-radius: 6px;
  background:
    linear-gradient(135deg, rgba(31, 143, 106, 0.14), rgba(22, 119, 255, 0.1)),
    repeating-linear-gradient(-35deg, transparent 0 8px, rgba(31, 143, 106, 0.1) 8px 10px), #f7fbf9;
  color: #0f5f47;
  font-weight: 800;
  letter-spacing: 2px;
  cursor: pointer;
  overflow: hidden;
}

.captcha-img img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-submit {
  width: 100%;
  height: 40px;
  margin-top: 16px;
  border-radius: 6px;
  font-weight: 700;
}

.login-support {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 12px;
  margin-top: 18px;
  color: var(--carbon-muted);
  font-size: 12px;
}

@media (max-width: 720px) {
  .auth-page {
    padding: 80px 24px 32px;
  }

  .login-brand {
    left: 24px;
    top: 24px;
  }

  .portal-tag {
    right: 24px;
    top: 24px;
  }
}
</style>
