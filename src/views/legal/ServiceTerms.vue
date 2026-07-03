<template>
  <main class="legal-page">
    <section class="legal-document">
      <div class="legal-header">
        <img :src="systemLogo" alt="" />
        <div>
          <p>企业碳数据管理平台</p>
          <h1>服务条款</h1>
        </div>
      </div>

      <article>
        <section v-for="item in termItems" :key="item.title" class="legal-section">
          <h2>{{ item.title }}</h2>
          <p>{{ item.content }}</p>
        </section>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import systemLogo from '@/assets/logo/logo.png';

const termItems = [
  { title: '服务范围', content: '本平台提供企业碳数据管理、核算建模、排放分析及可视化展示等数字化服务能力。' },
  { title: '使用许可', content: '客户在签订合同后获得系统使用权。未经许可，不得复制、转售或用于其他商业用途。' },
  { title: '部署模式', content: '平台支持本地化部署或与 Power BI 云服务结合的混合部署方式，具体以双方合同约定为准。' },
  { title: '账户与权限', content: '客户负责账号管理及权限配置，确保仅授权人员使用系统。' },
  { title: '服务可用性', content: '我们提供稳定的系统服务及技术支持，但不对不可抗力导致的服务中断承担责任。' },
  { title: '数据责任划分', content: '客户对其上传的数据真实性、合法性负责；平台不对数据内容承担法律责任。' },
  { title: '系统更新与维护', content: '平台将根据需要进行功能优化和升级，确保系统持续稳定运行。' },
  { title: '保密条款', content: '双方应对合作过程中涉及的商业信息和数据严格保密，未经对方许可不得披露。' },
  { title: '责任限制', content: '在法律允许范围内，平台方对因系统使用产生的间接损失不承担责任。' },
  { title: '法律适用', content: '本条款受中华人民共和国法律管辖。' }
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
