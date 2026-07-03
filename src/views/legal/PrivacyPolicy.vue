<template>
  <main class="legal-page">
    <section class="legal-document">
      <div class="legal-header">
        <img :src="systemLogo" alt="" />
        <div>
          <p>企业碳数据管理平台</p>
          <h1>隐私政策</h1>
        </div>
      </div>

      <article>
        <section v-for="item in privacyItems" :key="item.title" class="legal-section">
          <h2>{{ item.title }}</h2>
          <p>{{ item.content }}</p>
        </section>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import systemLogo from '@/assets/logo/logo.png';

const privacyItems = [
  {
    title: '数据安全承诺',
    content:
      '我们高度重视客户数据的安全与隐私保护。平台支持完全本地化部署，或“本地化系统 + Power BI 云服务”的混合模式。在任何部署模式下，客户数据始终由客户自主掌控，我们不主动获取、存储或使用客户业务数据。'
  },
  {
    title: '数据所有权',
    content: '所有业务数据、核算数据及分析结果均归客户所有。平台仅提供技术能力支持，不对客户数据进行任何商业利用。'
  },
  {
    title: '数据存储与访问控制',
    content:
      '在本地化部署模式下，数据存储于客户自有服务器或云环境，访问权限完全由客户管理。在混合模式下，仅分析展示服务涉及 Power BI 云能力，数据源仍保留在客户环境。'
  },
  {
    title: '数据传输与加密',
    content: '平台采用安全的数据传输机制（如 HTTPS 协议），支持访问控制、身份认证及日志审计功能，确保数据访问可控、可追溯。'
  },
  {
    title: '第三方服务（Power BI）',
    content: '若客户选择使用 Power BI 云服务，相关数据处理遵循微软的安全与合规标准。客户应自行管理其 Power BI 租户及相关权限配置。'
  },
  {
    title: '合规与法规遵循',
    content: '平台遵循中国相关法律法规（如《网络安全法》《数据安全法》《个人信息保护法》）及国际通行的数据安全规范。'
  },
  {
    title: '客户责任',
    content: '客户应妥善管理账号权限、访问控制及数据安全策略，确保系统使用过程中的信息安全。'
  }
];
</script>

<style lang="scss" scoped>
.legal-page {
  min-height: 100vh;
  padding: 40px 20px;
  background: #f5f7fb;
  color: #1f2937;
}

.legal-document {
  width: min(880px, 100%);
  margin: 0 auto;
  padding: 36px 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 10px 32px rgba(15, 23, 42, 0.08);
}

.legal-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.legal-header img {
  width: auto;
  height: 40px;
  max-width: 56px;
  object-fit: contain;
}

.legal-header p {
  margin: 0 0 4px;
  color: #1e7f4c;
  font-size: 14px;
  font-weight: 700;
}

.legal-header h1 {
  margin: 0;
  font-size: 26px;
  line-height: 1.3;
}

.legal-section {
  padding-top: 24px;
}

.legal-section h2 {
  margin: 0 0 8px;
  font-size: 18px;
}

.legal-section p {
  margin: 0;
  color: #4b5563;
  font-size: 15px;
  line-height: 1.85;
}

@media (max-width: 640px) {
  .legal-page {
    padding: 20px 12px;
  }

  .legal-document {
    padding: 24px 18px;
  }
}
</style>
