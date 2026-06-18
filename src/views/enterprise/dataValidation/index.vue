<template>
  <div class="p-2 enterprise-validation-page page-panel">
    <section class="page-head">
      <div>
        <h1>数据验证</h1>
        <p>按核算期间汇总活动数据提交、缺失与准确性结果。</p>
      </div>
    </section>

    <section class="panel mb-4">
      <el-form :model="queryParams" inline label-width="84px">
        <el-form-item label="核算期间">
          <el-date-picker v-model="queryParams.activityPeriod" type="month" value-format="YYYY-MM" placeholder="选择期间" clearable />
        </el-form-item>
      </el-form>
    </section>

    <el-row :gutter="16" class="mb-4">
      <el-col v-for="metric in metrics" :key="metric.label" :xs="12" :md="6">
        <el-card shadow="never" class="metric-card">
          <span>{{ metric.label }}</span>
          <strong :class="metric.className">{{ metric.value }}</strong>
          <small>{{ metric.sub }}</small>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="mb-4">
      <template #header>
        <div class="card-head">
          <span>提交状态追踪</span>
          <el-tag type="info" effect="plain">截止日 {{ dashboard.dueDate || '--' }}</el-tag>
        </div>
      </template>
      <el-table v-loading="loading" :data="submissions" border>
        <el-table-column prop="department" label="部门" width="130" />
        <el-table-column prop="responsiblePerson" label="负责人" width="110" />
        <el-table-column prop="facilityName" label="工厂/设施" min-width="150" show-overflow-tooltip />
        <el-table-column prop="expectedCount" label="应提交项" width="100" />
        <el-table-column prop="submittedCount" label="已提交" width="90" />
        <el-table-column prop="missingCount" label="缺失项" width="90" />
        <el-table-column prop="warningCount" label="待复核" width="90" />
        <el-table-column prop="activityPeriod" label="应提交期间" width="115" />
        <el-table-column prop="dueDate" label="截止日" width="115" />
        <el-table-column label="提交状态" width="105">
          <template #default="scope">
            <el-tag :type="submissionTag(scope.row.submissionStatus)">
              {{ submissionLabel(scope.row.submissionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="170">
          <template #default="scope">{{ formatDateTime(scope.row.submittedTime) }}</template>
        </el-table-column>
        <el-table-column label="数据准确率" width="110">
          <template #default="scope">{{ formatRate(scope.row.accuracyRate) }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-head">
          <span>问题清单</span>
          <el-tag :type="issues.length ? 'warning' : 'success'" effect="plain">{{ issues.length }} 项</el-tag>
        </div>
      </template>
      <el-table v-loading="loading" :data="issues" border>
        <el-table-column label="级别" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.severity === 'ERROR' ? 'danger' : 'warning'">
              {{ scope.row.severity === 'ERROR' ? '强错误' : '弱警告' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ruleName" label="规则" width="130" />
        <el-table-column prop="objectName" label="对象" min-width="220" show-overflow-tooltip />
        <el-table-column prop="activityPeriod" label="期间" width="100" />
        <el-table-column prop="description" label="问题描述" min-width="220" show-overflow-tooltip />
        <el-table-column prop="suggestion" label="建议" min-width="170" show-overflow-tooltip />
        <el-table-column label="状态" width="105">
          <template #default="scope">
            <el-tag :type="issueTag(scope.row.issueStatus)" effect="plain">{{ issueLabel(scope.row.issueStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="scope">
            <el-button link type="primary" icon="View" @click="openIssue(scope.row)">
              {{ scope.row.issueStatus === 'missing' ? '去录入' : '查看数据' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="EnterpriseDataValidation" lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getActivityDataValidationDashboard } from '@/api/enterprise/activityData';
import type { ActivityDataQuery, ActivityDataValidationDashboard, ActivityDataValidationIssue } from '@/api/enterprise/activityData/types';
import { useAutoQuery } from '@/hooks/useAutoQuery';

const router = useRouter();
const loading = ref(false);
const dashboard = ref<ActivityDataValidationDashboard>({});
const currentLocalMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};
const queryParams = reactive<ActivityDataQuery>({
  activityPeriod: currentLocalMonth()
});

const submissions = computed(() => dashboard.value.submissions ?? []);
const issues = computed(() => dashboard.value.issues ?? []);

const metrics = computed(() => [
  {
    label: '本期校验记录',
    value: dashboard.value.validatedRecordCount ?? 0,
    sub: '活动数据 / 绿证 / 分母',
    className: ''
  },
  {
    label: '异常项',
    value: dashboard.value.abnormalItems ?? 0,
    sub: '强错误或异常状态',
    className: (dashboard.value.abnormalItems ?? 0) > 0 ? 'is-danger' : 'is-success'
  },
  {
    label: '缺失项',
    value: dashboard.value.missingItems ?? 0,
    sub: '已识别排放源未填活动数据',
    className: (dashboard.value.missingItems ?? 0) > 0 ? 'is-warning' : 'is-success'
  },
  {
    label: '通过率',
    value: formatRate(dashboard.value.passRate),
    sub: '规则引擎',
    className: 'is-primary'
  }
]);

const loadDashboard = async () => {
  loading.value = true;
  try {
    const res = await getActivityDataValidationDashboard(queryParams);
    dashboard.value = res.data ?? {};
    if (!queryParams.activityPeriod && dashboard.value.activityPeriod) {
      queryParams.activityPeriod = dashboard.value.activityPeriod;
    }
  } finally {
    loading.value = false;
  }
};

const resetQuery = () => {
  queryParams.activityPeriod = currentLocalMonth();
  loadDashboard();
};

const submissionLabel = (status?: string) => {
  const labels: Record<string, string> = {
    submitted: '已提交',
    draft: '草稿',
    missing: '未提交'
  };
  return labels[status ?? ''] ?? status ?? '--';
};

const submissionTag = (status?: string) => {
  const tags: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    submitted: 'success',
    draft: 'warning',
    missing: 'danger'
  };
  return tags[status ?? ''] ?? 'info';
};

const issueLabel = (status?: string) => {
  const labels: Record<string, string> = {
    missing: '缺失',
    pending: '待复核',
    abnormal: '异常'
  };
  return labels[status ?? ''] ?? status ?? '--';
};

const issueTag = (status?: string) => {
  const tags: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    missing: 'danger',
    pending: 'warning',
    abnormal: 'danger'
  };
  return tags[status ?? ''] ?? 'info';
};

const formatRate = (value?: number) => (value === undefined || value === null ? '--' : `${Number(value).toFixed(1)}%`);

const formatDateTime = (value?: string) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const openIssue = (issue: ActivityDataValidationIssue) => {
  if (issue.ruleCode?.includes('GREEN_POWER')) {
    router.push('/green-electricity/green-electricity-data');
    return;
  }
  if (issue.ruleCode?.includes('DENOMINATOR')) {
    router.push('/intensity/intensity-denominator');
    return;
  }
  router.push({
    path: '/activity-data/emission-activity-data',
    query: {
      activityPeriod: issue.activityPeriod,
      emissionSourceCode: issue.emissionSourceCode
    }
  });
};

onMounted(() => {
  loadDashboard();
});

useAutoQuery(queryParams, () => loadDashboard());
</script>

<style scoped>
.enterprise-validation-page {
  min-height: calc(100vh - 84px);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.metric-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 108px;
}

.metric-card span,
.metric-card small {
  color: var(--el-text-color-secondary);
}

.metric-card strong {
  font-size: 28px;
  line-height: 1;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.metric-card strong.is-success {
  color: var(--el-color-success);
}

.metric-card strong.is-warning {
  color: var(--el-color-warning);
}

.metric-card strong.is-primary {
  color: var(--el-color-primary);
}

@media (max-width: 768px) {
  .enterprise-validation-page :deep(.el-form) {
    display: flex;
    flex-direction: column;
  }
}
</style>
