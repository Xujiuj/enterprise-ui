<template>
  <div class="app-container enterprise-home">
    <section class="page-head">
      <div>
        <h1>工作台</h1>
        <p>企业填报流程与本期数据验证概览。</p>
      </div>
      <div class="btns">
        <button type="button" class="btn primary" @click="openBusiness('/activity-data/emission-activity-data')">去录入</button>
        <button type="button" class="btn" @click="openBusiness('/report-management/report-template-download')">下载报表模板</button>
      </div>
    </section>

    <section v-loading="loading" class="dash-stats">
      <div v-for="item in statusCards" :key="item.label" class="dash-stat">
        <div class="label">{{ item.label }}</div>
        <div class="value" :class="item.valueClass">{{ displayValue(item.value) }}</div>
        <div class="sub">
          {{ item.note || '--' }}
          <span v-if="item.badge" class="kpi-mini" :class="item.badgeTone">{{ item.badge }}</span>
        </div>
      </div>
    </section>

    <section class="step-flow" aria-label="企业填报流程">
      <template v-for="(item, index) in businessActions" :key="item.path">
        <button type="button" class="step-card" @click="openBusiness(item.path)">
          <span class="step-num">{{ item.step }}</span>
          <span class="step-name">{{ item.title }}</span>
          <span class="step-desc">{{ item.detail }}</span>
        </button>
        <span v-if="index < businessActions.length - 1" class="step-arrow">→</span>
      </template>
    </section>

    <section class="workbench-grid">
      <div class="panel workbench-main">
        <div class="toolbar">
          <b>本期填报与核算闭环</b>
          <span class="hint">{{ currentPeriod }} · 从活动数据到报表库</span>
        </div>
        <div v-if="cycleStages.length || scopeEmissions.length" class="carbon-cycle-chart">
          <div v-for="stage in cycleStages" :key="stage.label" class="cycle-stage" :class="stage.tone">
            <strong>{{ displayValue(stage.value) }}</strong>
            <span>{{ stage.label }}</span>
            <em>{{ stage.detail || '--' }}</em>
          </div>
          <div v-if="scopeEmissions.length" class="scope-bars">
            <div v-for="bar in scopeBars" :key="bar.label">
              <b>{{ bar.label }}</b>
              <span><i :style="{ width: bar.width }"></i></span>
              <em>{{ bar.value }}</em>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无本期填报与核算数据" :image-size="72" />
      </div>

      <div class="panel notice-panel">
        <div class="toolbar">
          <b>系统通知</b>
        </div>
        <div v-if="systemNotices.length" class="notice-list">
          <button
            v-for="notice in systemNotices"
            :key="notice.noticeId"
            type="button"
            class="notice-item"
            :class="{ active: notice.status === '0' }"
            @click="openNotice(notice)"
          >
            <b>{{ notice.noticeTitle || '未命名公告' }}</b>
            <span>{{ plainText(notice.noticeContent || notice.remark || '') || '--' }}</span>
          </button>
        </div>
        <el-empty v-else description="暂无系统通知" :image-size="72" />
      </div>
    </section>

    <section class="dash-row">
      <div class="panel">
        <div class="toolbar">
          <b>待办事项</b>
        </div>
        <div v-if="todoItems.length" class="todo-list" role="list">
          <article v-for="item in todoItems" :key="item.type + item.content" class="todo-card" role="listitem">
            <div class="todo-copy">
              <span class="todo-type">{{ item.type || '--' }}</span>
              <b>{{ item.content || '--' }}</b>
            </div>
            <div class="todo-side">
              <span class="tag" :class="item.tone">{{ item.status || '--' }}</span>
              <button v-if="item.path" type="button" class="btn text" @click="openBusiness(item.path)">{{ item.action || '查看' }}</button>
              <span v-else class="todo-empty-action">--</span>
            </div>
          </article>
        </div>
        <el-empty v-else description="暂无待办事项" :image-size="72" />
      </div>

      <div class="panel">
        <div class="toolbar">
          <b>最近动态</b>
        </div>
        <div v-if="recentActivities.length" class="timeline">
          <div v-for="item in recentActivities" :key="item.title + item.time" class="tl-item" :class="item.tone">
            <b>{{ item.title }}</b>
            <span>{{ item.time || '--' }}</span>
            <p v-if="item.detail">{{ item.detail }}</p>
          </div>
        </div>
        <el-empty v-else description="暂无最近动态" :image-size="72" />
      </div>
    </section>

    <el-dialog v-model="noticeDialog.visible" :title="noticeDialog.notice?.noticeTitle || '公告详情'" width="720px" append-to-body>
      <div class="notice-detail">
        <div class="notice-meta">
          <span>{{ noticeDialog.notice?.createTime || '--' }}</span>
        </div>
        <div class="notice-content" v-html="noticeDialog.notice?.noticeContent || noticeDialog.notice?.remark || '暂无公告内容'"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="Index" lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { getWorkbenchOverview } from '@/api/enterprise/workbench';
import type {
  WorkbenchCycleStage,
  WorkbenchMetricCard,
  WorkbenchOverview,
  WorkbenchRecentActivity,
  WorkbenchScopeEmission,
  WorkbenchSystemNotice,
  WorkbenchTodoItem
} from '@/api/enterprise/workbench/types';

const router = useRouter();
const loading = ref(false);
const overview = ref<WorkbenchOverview>({});
const noticeDialog = reactive<{ visible: boolean; notice?: WorkbenchSystemNotice }>({
  visible: false
});

const emptyCards: WorkbenchMetricCard[] = [
  { label: '当前期间', value: '--', note: '--' },
  { label: '授权状态', value: '--', note: '--' },
  { label: '因子库版本', value: '--', note: '--' },
  { label: '数据进度', value: '--', note: '--' }
];

const displayValue = (value?: number | string) => (value === undefined || value === null || value === '' ? '--' : value);

const formatNumber = (value?: number | string) => {
  if (value === undefined || value === null || value === '') return '--';
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toLocaleString('zh-CN') : String(value);
};

const isCarbonTotalLabel = (label?: string) => Boolean(label && /碳排放总量|排放总量|CO2e/i.test(label));

const findMetricCard = (cards: WorkbenchMetricCard[], patterns: RegExp[]) =>
  cards.find((card) => patterns.some((pattern) => pattern.test(card.label)));

const currentPeriod = computed(() => overview.value.currentPeriod || '--');
const cycleStages = computed<WorkbenchCycleStage[]>(() => overview.value.cycleStages || []);
const scopeEmissions = computed<WorkbenchScopeEmission[]>(() => overview.value.scopeEmissions || []);
const todoItems = computed<WorkbenchTodoItem[]>(() => overview.value.todoItems || []);
const recentActivities = computed<WorkbenchRecentActivity[]>(() => overview.value.recentActivities || []);
const systemNotices = computed<WorkbenchSystemNotice[]>(() => overview.value.systemNotices || []);

const statusCards = computed<WorkbenchMetricCard[]>(() => {
  const cards = (overview.value.statusCards || []).filter((card) => !isCarbonTotalLabel(card.label));
  const periodCard = findMetricCard(cards, [/当前期间/, /本期/, /期间/]) || {
    label: '当前期间',
    value: currentPeriod.value,
    note: '当前填报周期'
  };
  const authCard = findMetricCard(cards, [/授权/, /许可/, /状态/]) || emptyCards[1];
  const factorCard = findMetricCard(cards, [/因子库/, /因子.*版本/, /版本/]) || emptyCards[2];
  const progressCard = findMetricCard(cards, [/进度/, /录入/, /填报/, /报表库/, /可用记录/]) || emptyCards[3];
  return [periodCard, authCard, factorCard, progressCard];
});

const scopeBars = computed(() =>
  scopeEmissions.value.map((item) => ({
    label: item.label,
    width: `${Math.max(0, Math.min(Number(item.percent || 0), 100))}%`,
    value: item.value === undefined || item.value === null ? '--' : `${formatNumber(item.value)} ${item.unit || ''}`.trim()
  }))
);

const businessActions = [
  { step: '01', title: '配置排放源', detail: '建立排放源台账', path: '/emission-source-config/emission-source' },
  { step: '02', title: '确认排放因子', detail: '匹配因子库，支持企业自主登记', path: '/factor-confirm/ef-factor' },
  { step: '03', title: '录入活动数据', detail: '上传并校验 656 表数据', path: '/activity-data/emission-activity-data' },
  { step: '04', title: '绿电绿证', detail: '登记抵扣记录', path: '/green-electricity/green-electricity-data' },
  { step: '05', title: '强度管理', detail: '分母录入与目标核算', path: '/intensity/intensity-target' }
];

const plainText = (value: string) =>
  value
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

const openBusiness = (path: string) => {
  router.push(path);
};

const openNotice = (notice: WorkbenchSystemNotice) => {
  noticeDialog.notice = notice;
  noticeDialog.visible = true;
};

const loadOverview = async () => {
  loading.value = true;
  try {
    const res = await getWorkbenchOverview();
    overview.value = res.data || {};
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadOverview();
});
</script>

<style lang="scss" scoped>
.enterprise-home {
  color: var(--carbon-ink);
}

.dash-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.dash-stat {
  position: relative;
  display: grid;
  gap: 12px;
  min-height: 126px;
  padding: 22px 24px;
  border: 1px solid var(--carbon-soft-line);
  border-left: 4px solid var(--carbon-brand);
  border-radius: 8px;
  background: var(--carbon-panel);
  box-shadow: var(--carbon-shadow);
}

.dash-stat .label {
  color: var(--carbon-muted);
  font-size: 14px;
  font-weight: 600;
}

.dash-stat .value {
  color: var(--carbon-ink);
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
  overflow-wrap: anywhere;
}

.dash-stat .value.is-success {
  color: var(--carbon-success);
}

.dash-stat .value.is-warning {
  color: var(--carbon-warning);
}

.dash-stat .sub {
  min-height: 22px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  color: var(--carbon-muted);
  font-size: 13px;
}

.kpi-mini {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.kpi-mini.up {
  background: rgba(24, 160, 88, 0.12);
  color: var(--carbon-success);
}

.kpi-mini.down {
  background: rgba(217, 45, 32, 0.1);
  color: var(--carbon-danger);
}

.step-flow {
  display: grid;
  grid-template-columns: minmax(136px, 1fr) 28px minmax(136px, 1fr) 28px minmax(136px, 1fr) 28px minmax(136px, 1fr) 28px minmax(136px, 1fr);
  align-items: stretch;
  gap: 10px;
  margin-bottom: 14px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.step-card {
  min-height: 118px;
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 9px;
  align-content: start;
  padding: 16px;
  border: 1px solid var(--carbon-soft-line);
  border-radius: 8px;
  background: var(--carbon-panel);
  color: var(--carbon-text);
  text-align: left;
  cursor: pointer;
  box-shadow: var(--carbon-shadow);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.step-card:hover {
  border-color: rgba(30, 127, 76, 0.4);
  box-shadow: 0 12px 28px -18px rgba(30, 127, 76, 0.45);
  transform: translateY(-1px);
}

.step-num {
  width: 38px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgba(30, 127, 76, 0.12);
  color: var(--carbon-primary);
  font-size: 12px;
  font-weight: 800;
}

.step-name {
  color: var(--carbon-ink);
  font-size: 15px;
  font-weight: 700;
}

.step-desc {
  color: var(--carbon-muted);
  font-size: 12px;
  line-height: 1.5;
}

.step-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--carbon-muted);
  font-weight: 800;
}

.workbench-grid {
  display: grid;
  grid-template-columns: minmax(0, 2.1fr) minmax(280px, 0.9fr);
  gap: 20px;
  margin: 20px 0;
}

.workbench-main,
.notice-panel {
  overflow: hidden;
}

.carbon-cycle-chart {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  padding: 18px;
}

.cycle-stage {
  min-height: 132px;
  display: grid;
  align-content: start;
  gap: 8px;
  padding: 16px;
  border: 1px solid var(--carbon-soft-line);
  border-radius: 8px;
  background: var(--carbon-panel-soft);
}

.cycle-stage strong {
  color: var(--carbon-ink);
  font-size: 26px;
  line-height: 1;
}

.cycle-stage span {
  color: var(--carbon-text);
  font-weight: 700;
}

.cycle-stage em {
  color: var(--carbon-muted);
  font-size: 12px;
  font-style: normal;
  line-height: 1.5;
}

.cycle-stage.done {
  border-color: rgba(24, 160, 88, 0.18);
}

.cycle-stage.warn {
  border-color: rgba(212, 136, 6, 0.24);
}

.cycle-stage.info {
  border-color: rgba(22, 119, 255, 0.18);
}

.scope-bars {
  grid-column: 1 / -1;
  display: grid;
  gap: 12px;
  padding: 6px 2px 0;
}

.scope-bars div {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) 140px;
  align-items: center;
  gap: 12px;
  color: var(--carbon-text);
  font-size: 13px;
}

.scope-bars span {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--carbon-soft-line);
}

.scope-bars i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--carbon-brand), var(--carbon-primary));
}

.scope-bars em {
  color: var(--carbon-muted);
  font-style: normal;
  text-align: right;
}

.notice-list {
  padding: 18px;
  display: grid;
  gap: 16px;
}

.notice-item {
  position: relative;
  padding: 0 0 0 18px;
  border: 0;
  background: transparent;
  color: var(--carbon-text);
  text-align: left;
  cursor: pointer;
}

.notice-item::before,
.tl-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--carbon-muted);
  box-shadow: 0 0 0 3px var(--carbon-soft-line);
}

.notice-item.active::before,
.tl-item.ok::before {
  background: var(--carbon-primary);
  box-shadow: 0 0 0 3px rgba(30, 127, 76, 0.14);
}

.notice-item b {
  display: block;
  color: var(--carbon-ink);
  font-size: 13px;
}

.notice-item span {
  display: -webkit-box;
  margin-top: 6px;
  overflow: hidden;
  color: var(--carbon-muted);
  font-size: 12px;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.dash-row {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 20px;
}

.todo-list {
  display: grid;
  gap: 12px;
  padding: 18px;
}

.todo-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  min-height: 72px;
  padding: 14px 16px;
  border: 1px solid var(--carbon-soft-line);
  border-radius: 8px;
  background: var(--carbon-panel-soft);
}

.todo-copy {
  display: grid;
  min-width: 0;
  gap: 8px;
}

.todo-copy b {
  overflow-wrap: anywhere;
  color: var(--carbon-ink);
  font-size: 14px;
  line-height: 1.55;
}

.todo-type {
  width: fit-content;
  min-width: 48px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border: 1px solid rgba(30, 127, 76, 0.24);
  border-radius: 6px;
  background: var(--carbon-green-soft);
  color: var(--carbon-brand);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.todo-side {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  white-space: nowrap;
}

.todo-empty-action {
  color: var(--carbon-muted);
  font-size: 13px;
}

.timeline {
  display: grid;
  gap: 16px;
  padding: 18px;
}

.tl-item {
  position: relative;
  padding-left: 18px;
}

.tl-item b {
  display: block;
  color: var(--carbon-ink);
  font-size: 13px;
}

.tl-item span,
.tl-item p {
  display: block;
  margin: 6px 0 0;
  color: var(--carbon-muted);
  font-size: 12px;
  line-height: 1.5;
}

.notice-detail {
  display: grid;
  gap: 14px;
}

.notice-meta {
  color: var(--carbon-muted);
  font-size: 12px;
}

.notice-content {
  color: var(--carbon-text);
  line-height: 1.8;
}

:global(html.dark) {
  .enterprise-home {
    color: var(--carbon-ink);
  }

  .step-card,
  .dash-stat,
  .cycle-stage,
  .todo-card,
  .workbench-main,
  .notice-panel,
  .dash-row .panel {
    background: var(--carbon-panel);
    border-color: var(--carbon-soft-line);
    box-shadow: var(--carbon-shadow-soft);
  }

  .cycle-stage {
    background: var(--carbon-panel-soft);
  }

  .step-card:hover {
    border-color: rgba(96, 165, 250, 0.42);
    box-shadow: 0 12px 28px -18px rgba(96, 165, 250, 0.48);
  }

  .step-num,
  .kpi-mini.up {
    background: rgba(69, 212, 131, 0.16);
  }

  .kpi-mini.down {
    background: rgba(248, 113, 113, 0.14);
  }

  .scope-bars span {
    background: var(--carbon-soft-line);
  }

  .notice-item.active::before,
  .tl-item.ok::before {
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.18);
  }
}

@media (max-width: 1200px) {
  .dash-stats,
  .workbench-grid,
  .dash-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .carbon-cycle-chart {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .dash-stats,
  .workbench-grid,
  .dash-row,
  .carbon-cycle-chart {
    grid-template-columns: 1fr;
  }

  .step-flow {
    grid-template-columns: 1fr;
    overflow: visible;
  }

  .step-arrow {
    justify-content: center;
    transform: rotate(90deg);
  }

  .scope-bars div {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .scope-bars em {
    text-align: left;
  }

  .todo-card {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .todo-side {
    justify-content: space-between;
  }
}
</style>
