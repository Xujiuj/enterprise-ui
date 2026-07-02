<template>
  <div class="login-page auth-page">
    <div class="login-brand">
      <img class="logo-mark" :src="systemLogo" alt="" />
      <span>企业碳管理数字化平台</span>
    </div>
    <span class="portal-tag">企业端</span>

    <div class="login-box">
      <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-card">
        <div class="login-header">
          <h2>企业碳管理数字化平台</h2>
          <p>统一数据 · 精准核算 · 管理赋能</p>
        </div>

        <div v-if="showExpiryNotice" class="login-expiry-alert">
          <span class="alert-icon">!</span>
          <div class="alert-text">
            <b>系统授权已到期</b>
            <p>当前授权已过期，请续费后继续使用。</p>
            <div class="pay-btns">
              <button type="button" class="btn-alipay" :disabled="!!paymentOpening" @click="openSupportLink('alipay')">
                {{ paymentOpening === 'ALIPAY' ? '打开中' : '支付宝支付' }}
              </button>
              <button type="button" class="btn-wechat" :disabled="!!paymentOpening" @click="openSupportLink('wechat')">
                {{ paymentOpening === 'WECHAT' ? '打开中' : '微信支付' }}
              </button>
            </div>
          </div>
        </div>

        <el-form-item prop="username" label="账号" class="login-field">
          <el-input v-model="loginForm.username" autocomplete="username" placeholder="请输入账号" />
        </el-form-item>

        <el-form-item prop="password" label="密码" class="login-field">
          <el-input
            v-model="loginForm.password"
            type="password"
            autocomplete="current-password"
            placeholder="请输入密码"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item v-if="captchaEnabled" prop="code" label="图形验证码" class="login-field">
          <div class="captcha-field">
            <el-input v-model="loginForm.code" autocomplete="off" placeholder="请输入验证码" @keyup.enter="handleLogin" />
            <button type="button" class="captcha-img" aria-label="刷新验证码" @click="getCode">
              <img v-if="codeUrl" :src="codeUrl" alt="验证码" />
              <span v-else>8A21</span>
            </button>
          </div>
        </el-form-item>

        <div class="login-field license-file-field">
          <label>授权文件</label>
          <label class="file-picker compact">
            <input type="file" accept=".lic" @change="handleLicenseFileChange" />
            <span>选择 .lic 文件</span>
            <em>{{ selectedLicenseFileName || '未选择文件' }}</em>
          </label>
        </div>

        <div class="login-options">
          <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
          <el-checkbox v-model="autoLogin">自动登录</el-checkbox>
        </div>

        <el-button :loading="loading" type="primary" class="btn primary login-submit" @click.prevent="handleLogin">
          <span v-if="!loading">登录</span>
          <span v-else>校验中...</span>
        </el-button>
      </el-form>
    </div>

    <div class="login-footer">
      <p>技术支持：15099663016 &nbsp;|&nbsp; service@fengxingdata.com</p>
      <p>
        <a :href="supportLinks.website" target="_blank" rel="noreferrer">官方网站</a> ·
        <a :href="supportLinks.privacy" target="_blank" rel="noreferrer">隐私政策</a> ·
        <a :href="supportLinks.terms" target="_blank" rel="noreferrer">服务条款</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCodeImg } from '@/api/login';
import { useUserStore } from '@/store/modules/user';
import { LoginData } from '@/api/types';
import { to } from 'await-to-js';
import { useI18n } from 'vue-i18n';
import { buildVendorCashierFallbackUrl, createOnlinePurchaseOrder } from '@/api/enterprise/onlinePurchase';
import type { OnlinePurchasePayChannel } from '@/api/enterprise/onlinePurchase/types';
import systemLogo from '@/assets/logo/logo.png';

const userStore = useUserStore();
const router = useRouter();
const { t } = useI18n();

const loginForm = ref<LoginData>({
  tenantId: '000000',
  username: '',
  password: '',
  rememberMe: false,
  code: '',
  uuid: ''
} as LoginData);

const loginRules = computed<ElFormRules>(() => ({
  username: [{ required: true, trigger: 'blur', message: t('login.rule.username.required') }],
  password: [{ required: true, trigger: 'blur', message: t('login.rule.password.required') }],
  ...(captchaEnabled.value ? { code: [{ required: true, trigger: 'change', message: t('login.rule.code.required') }] } : {})
}));

const codeUrl = ref('');
const loading = ref(false);
const captchaEnabled = ref(true);
const redirect = ref('/');
const loginRef = ref<ElFormInstance>();
const selectedLicenseFileName = ref('');
const autoLogin = ref(false);
const autoLoginTriggered = ref(false);
const paymentOpening = ref<OnlinePurchasePayChannel>();
const LOGIN_STORAGE_KEYS = {
  tenantId: 'enterpriseLoginTenantId',
  username: 'enterpriseLoginUsername',
  password: 'enterpriseLoginPassword',
  rememberMe: 'enterpriseLoginRememberMe',
  autoLogin: 'enterpriseLoginAutoLogin'
} as const;
const showExpiryNotice = computed(() => {
  const query = router.currentRoute.value.query;
  return query.license === 'expired' || query.expired === '1';
});
const supportLinks = {
  website: 'https://www.carbondata.com',
  privacy: 'https://www.carbondata.com/privacy',
  terms: 'https://www.carbondata.com/terms'
};

watch(
  () => router.currentRoute.value,
  (newRoute: any) => {
    redirect.value = newRoute.query && newRoute.query.redirect && decodeURIComponent(newRoute.query.redirect);
  },
  { immediate: true }
);

watch(autoLogin, (enabled) => {
  if (enabled) {
    loginForm.value.rememberMe = true;
  }
});

watch(
  () => loginForm.value.rememberMe,
  (rememberMe) => {
    if (!rememberMe) {
      autoLogin.value = false;
    }
  }
);

const getLoginData = () => {
  const rememberMe = localStorage.getItem(LOGIN_STORAGE_KEYS.rememberMe) === 'true';
  const savedUsername = localStorage.getItem(LOGIN_STORAGE_KEYS.username);
  const savedPassword = localStorage.getItem(LOGIN_STORAGE_KEYS.password);
  const savedTenantId = localStorage.getItem(LOGIN_STORAGE_KEYS.tenantId);

  loginForm.value = {
    ...loginForm.value,
    tenantId: savedTenantId || loginForm.value.tenantId,
    username: rememberMe && savedUsername ? savedUsername : loginForm.value.username,
    password: rememberMe && savedPassword ? savedPassword : loginForm.value.password,
    rememberMe
  } as LoginData;
  autoLogin.value = rememberMe && localStorage.getItem(LOGIN_STORAGE_KEYS.autoLogin) === 'true';
};

const syncLoginPreference = () => {
  localStorage.setItem(LOGIN_STORAGE_KEYS.autoLogin, String(autoLogin.value));

  if (!loginForm.value.rememberMe) {
    localStorage.removeItem(LOGIN_STORAGE_KEYS.tenantId);
    localStorage.removeItem(LOGIN_STORAGE_KEYS.username);
    localStorage.removeItem(LOGIN_STORAGE_KEYS.password);
    localStorage.removeItem(LOGIN_STORAGE_KEYS.rememberMe);
    localStorage.removeItem(LOGIN_STORAGE_KEYS.autoLogin);
    return;
  }

  localStorage.setItem(LOGIN_STORAGE_KEYS.tenantId, String(loginForm.value.tenantId || '000000'));
  localStorage.setItem(LOGIN_STORAGE_KEYS.username, String(loginForm.value.username || ''));
  localStorage.setItem(LOGIN_STORAGE_KEYS.password, String(loginForm.value.password || ''));
  localStorage.setItem(LOGIN_STORAGE_KEYS.rememberMe, 'true');
};

const handleLogin = () => {
  if (!captchaEnabled.value) {
    loginRef.value?.clearValidate('code');
  }
  loginRef.value?.validate(async (valid: boolean, fields: any) => {
    if (!valid) {
      console.log('error submit!', fields);
      return;
    }

    loading.value = true;
    loginForm.value.tenantId = '000000';
    const [err] = await to(userStore.login(loginForm.value));
    if (!err) {
      syncLoginPreference();
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
    return;
  }

  codeUrl.value = '';
  loginForm.value.code = '';
  loginForm.value.uuid = '';
  await nextTick();
  loginRef.value?.clearValidate('code');
  if (autoLogin.value && loginForm.value.username && loginForm.value.password && !autoLoginTriggered.value) {
    autoLoginTriggered.value = true;
    handleLogin();
  }
};

const handleLicenseFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  selectedLicenseFileName.value = input.files?.[0]?.name || '';
};

const openSupportLink = async (type: 'alipay' | 'wechat') => {
  const payChannel: OnlinePurchasePayChannel = type === 'wechat' ? 'WECHAT' : 'ALIPAY';
  const query = router.currentRoute.value.query;
  const packageId = String(query.packageId || import.meta.env.VITE_DEFAULT_PURCHASE_PACKAGE_ID || '1001');
  const returnUrl = window.location.href;
  paymentOpening.value = payChannel;

  try {
    const response = await createOnlinePurchaseOrder({
      packageId,
      payChannel,
      customerName: String(query.customerName || loginForm.value.username || '企业客户'),
      customerCode: String(query.customerCode || ''),
      licenseId: String(query.licenseId || ''),
      installId: String(query.installId || ''),
      returnUrl
    });
    const order = response.data;
    window.open(order.payUrl || buildVendorCashierFallbackUrl(payChannel, { packageId, returnUrl }), '_blank', 'noopener,noreferrer');
  } catch {
    window.open(
      buildVendorCashierFallbackUrl(payChannel, {
        packageId,
        licenseId: String(query.licenseId || ''),
        installId: String(query.installId || ''),
        returnUrl
      }),
      '_blank',
      'noopener,noreferrer'
    );
  } finally {
    paymentOpening.value = undefined;
  }
};

onMounted(() => {
  getLoginData();
  getCode();
});
</script>

<style lang="scss" scoped>
.auth-page {
  --login-card-bg: rgba(255, 255, 255, 0.95);
  --login-card-border: rgba(255, 255, 255, 0.48);
  --login-title: #1f2937;
  --login-label: #4b5563;
  --login-input-bg: #fff;
  --login-input-text: #1f2937;
  --login-input-placeholder: #9ca3af;
  --login-input-border: #d6dce5;
  --login-captcha-border: #b9d9ca;
  --login-captcha-bg: #f7fbf9;
  --login-captcha-text: #0f5f47;
  --login-file-bg: #f7fbf9;
  --login-file-chip-bg: #e7f6ef;
  --login-alert-bg: #fff7f3;
  --login-alert-border: #ffd7c9;
  --login-alert-text: #9a3412;
  --login-alert-title: #7c2d12;

  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: url('../assets/images/login-gradient-bg.png') center / cover no-repeat;
  overflow: hidden;
}

.auth-page::before,
.auth-page::after {
  display: none;
}

html.dark .auth-page {
  --login-card-bg: rgba(17, 24, 39, 0.92);
  --login-card-border: rgba(148, 163, 184, 0.28);
  --login-title: #f8fafc;
  --login-label: #cbd5e1;
  --login-input-bg: rgba(15, 23, 42, 0.9);
  --login-input-text: #f3f4f6;
  --login-input-placeholder: #64748b;
  --login-input-border: #334155;
  --login-captcha-border: rgba(69, 212, 131, 0.34);
  --login-captcha-bg: #12201d;
  --login-captcha-text: #7ee2a8;
  --login-file-bg: rgba(18, 32, 29, 0.88);
  --login-file-chip-bg: rgba(69, 212, 131, 0.16);
  --login-alert-bg: rgba(67, 20, 7, 0.42);
  --login-alert-border: rgba(251, 146, 60, 0.36);
  --login-alert-text: #fed7aa;
  --login-alert-title: #ffedd5;
}

.login-brand,
.portal-tag {
  position: fixed;
  top: 48px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  color: #1e7f4c;
  pointer-events: auto;
}

.login-brand {
  left: 48px;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid rgba(30, 127, 76, 0.16);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
}

.logo-mark {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.portal-tag {
  right: 48px;
  height: 32px;
  gap: 6px;
  padding: 0 14px;
  border: 1px solid rgba(30, 127, 76, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.62);
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
  margin-right: 0;
}

.login-card {
  width: 100%;
  padding: 36px 32px 26px;
  border: 1px solid var(--login-card-border);
  border-radius: 8px;
  background: var(--login-card-bg);
  box-shadow: 0 28px 70px rgba(3, 36, 27, 0.34);
  backdrop-filter: blur(16px);
}

.login-header {
  margin-bottom: 20px;
  text-align: center;
}

.login-header h2 {
  margin: 0 0 20px;
  color: var(--login-title);
  font-size: 20px;
  font-weight: 700;
}

.login-header p {
  margin: -12px 0 0;
  color: var(--carbon-muted);
  font-size: 12px;
  letter-spacing: 0;
}

.login-expiry-alert {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid var(--login-alert-border);
  border-radius: 8px;
  background: var(--login-alert-bg);
  color: var(--login-alert-text);
}

.alert-icon {
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f97316;
  color: #fff;
  font-weight: 800;
  line-height: 1;
}

.alert-text {
  min-width: 0;
}

.alert-text b {
  display: block;
  color: var(--login-alert-title);
  font-size: 14px;
}

.alert-text p {
  margin: 4px 0 10px;
  font-size: 12px;
  line-height: 1.5;
}

.pay-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn-alipay,
.btn-wechat {
  height: 28px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.btn-alipay:disabled,
.btn-wechat:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.btn-alipay {
  background: #1677ff;
}

.btn-wechat {
  background: #18a058;
}

.login-field {
  margin-bottom: 12px;
}

.login-card :deep(.el-form-item) {
  display: block;
}

.login-card :deep(.el-form-item__label) {
  justify-content: flex-start;
  height: auto;
  margin-bottom: 6px;
  color: var(--login-label);
  font-weight: 500;
  line-height: 1.5;
}

.login-card :deep(.el-input__wrapper) {
  min-height: 36px;
  border-radius: 6px;
  background: var(--login-input-bg);
  box-shadow: 0 0 0 1px var(--login-input-border) inset;
}

.login-card :deep(.el-input__inner) {
  color: var(--login-input-text);
  background: transparent;
}

.login-card :deep(.el-input__inner::placeholder) {
  color: var(--login-input-placeholder);
}

.login-card :deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px var(--carbon-primary) inset,
    0 0 0 3px rgba(30, 127, 76, 0.14);
}

.captcha-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 104px;
  gap: 8px;
}

.captcha-img {
  height: 36px;
  border: 1px solid var(--login-captcha-border);
  border-radius: 6px;
  background:
    linear-gradient(135deg, rgba(30, 127, 76, 0.14), rgba(67, 169, 110, 0.1)),
    repeating-linear-gradient(-35deg, transparent 0 8px, rgba(30, 127, 76, 0.1) 8px 10px), var(--login-captcha-bg);
  color: var(--login-captcha-text);
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

.license-file-field {
  margin-bottom: 0;
}

.license-file-field > label:first-child {
  margin-bottom: 6px;
  color: var(--login-label);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}

.file-picker {
  min-height: 36px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border: 1px dashed var(--login-captcha-border);
  border-radius: 6px;
  background: var(--login-file-bg);
  cursor: pointer;
}

.file-picker input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.file-picker span {
  height: 24px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 4px;
  background: var(--login-file-chip-bg);
  color: var(--login-captcha-text);
  font-size: 12px;
  font-weight: 700;
}

.file-picker em {
  min-width: 0;
  color: var(--carbon-muted);
  font-size: 12px;
  font-style: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.login-options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 4px 16px;
  margin: 12px 0 2px;
}

.login-options :deep(.el-checkbox) {
  height: 28px;
  margin-right: 0;
  color: var(--login-label);
}

.login-submit {
  width: 100%;
  height: 40px;
  margin-top: 16px;
  border-radius: 6px;
  font-weight: 700;
}

.login-footer {
  position: fixed;
  left: 24px;
  right: 24px;
  bottom: 22px;
  z-index: 1;
  color: rgba(255, 255, 255, 0.86);
  font-size: 12px;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.login-footer p {
  margin: 4px 0;
}

.login-footer a {
  color: #fff;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 720px) {
  .auth-page {
    padding: 80px 24px 88px;
    justify-content: center;
  }

  .login-brand {
    left: 24px;
    top: 24px;
  }

  .portal-tag {
    right: 24px;
    top: 24px;
  }

  .login-footer {
    bottom: 14px;
  }

  .login-box {
    margin-right: 0;
  }
}
</style>
