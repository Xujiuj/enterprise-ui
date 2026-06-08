<template>
  <div class="app-container enterprise-home">
    <section class="page-head">
      <div>
        <h1>企业本地工作台</h1>
        <p>聚合 License 状态、01-05 录入进度、因子同步与报表模板下载待办。</p>
      </div>
    </section>

    <section class="status-grid">
      <div v-for="item in statusCards" :key="item.label" class="status-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <em :class="item.tone">{{ item.note }}</em>
      </div>
    </section>

    <section class="action-grid">
      <button v-for="item in businessActions" :key="item.path" type="button" class="action-card" @click="openBusiness(item.path)">
        <span class="action-icon">{{ item.step }}</span>
        <strong>{{ item.title }}</strong>
        <em>{{ item.detail }}</em>
      </button>
    </section>

    <section class="panel">
      <div class="toolbar">
        <b>01-05 录入进度</b>
        <span class="hint">按企业本地流程展示，不包含厂商客户、签发、分发或续费运营入口。</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>环节</th>
            <th>当前状态</th>
            <th>负责人</th>
            <th>更新时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in workflowItems" :key="item.name">
            <td>{{ item.name }}</td>
            <td><span class="tag" :class="item.tone">{{ item.status }}</span></td>
            <td>{{ item.owner }}</td>
            <td>{{ item.updatedAt }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="home-columns">
      <div class="panel">
        <div class="toolbar">
          <b>因子同步</b>
          <span class="hint">只读查询企业可用因子。</span>
        </div>
        <div class="todo-list">
          <div v-for="item in factorTasks" :key="item.title" class="todo-row">
            <span>{{ item.title }}</span>
            <em>{{ item.detail }}</em>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="toolbar">
          <b>报表模板下载</b>
          <span class="hint">下载已发布模板。</span>
        </div>
        <div class="todo-list">
          <div v-for="item in reportTasks" :key="item.title" class="todo-row">
            <span>{{ item.title }}</span>
            <em>{{ item.detail }}</em>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup name="Index" lang="ts">
const router = useRouter();

const statusCards = [
  { label: 'License 状态', value: '有效', note: '剩余 86 天', tone: 'ok' },
  { label: '录入完成率', value: '68%', note: '3 项待确认', tone: 'warn' },
  { label: '因子同步', value: '今日 09:20', note: '最新', tone: 'ok' },
  { label: '报表模板', value: '12 个', note: '可下载', tone: 'info' }
];

const businessActions = [
  { step: 'L', title: 'License 授权/导入', detail: '导入 .lic 并查看本地授权状态', path: '/enterprise/license-import' },
  { step: '01', title: '配置排放源', detail: '维护企业本地排放源主数据', path: '/enterprise/emission-source' },
  { step: '02', title: '确认排放因子', detail: '确认企业可用因子和引用口径', path: '/enterprise/factor-confirm' },
  { step: '03', title: '活动数据填报', detail: '录入 sheet_656 活动数据', path: '/enterprise/activity-data' },
  { step: '04', title: '绿电绿证', detail: '补齐绿电、绿证相关数据', path: '/enterprise/green-electricity' },
  { step: '05', title: '强度管理', detail: '维护强度指标分母和结果', path: '/enterprise/intensity' },
  { step: 'F', title: '因子查询', detail: '只读查询企业可用因子库', path: '/enterprise/factor-library' },
  { step: 'R', title: '报表模板下载', detail: '下载已发布报表模板', path: '/enterprise/report-template-download' }
];

const workflowItems = [
  { name: '01 配置排放源', status: '已完成', owner: '数据管理员', updatedAt: '2026-06-08 09:10', tone: 'ok' },
  { name: '02 确认排放因子', status: '待确认', owner: '核算专员', updatedAt: '2026-06-08 09:18', tone: 'warn' },
  { name: '03 活动数据', status: '录入中', owner: '业务部门', updatedAt: '2026-06-08 09:30', tone: 'info' },
  { name: '04 绿电绿证', status: '待补充', owner: '能源管理员', updatedAt: '2026-06-07 17:42', tone: 'gray' },
  { name: '05 强度管理', status: '未开始', owner: '管理组', updatedAt: '2026-06-07 16:05', tone: 'gray' }
];

const factorTasks = [
  { title: '组织边界因子', detail: '2 个因子等待确认引用范围' },
  { title: '电力排放因子', detail: '已同步 2026 年最新口径' },
  { title: '运输活动因子', detail: '3 条记录需要业务复核' }
];

const reportTasks = [
  { title: '月度碳排放汇总模板', detail: '适用于 01-05 全流程数据' },
  { title: '强度指标分析模板', detail: '依赖强度管理数据完成后下载' },
  { title: '绿电绿证明细模板', detail: '待绿电绿证数据补齐' }
];

const openBusiness = (path: string) => {
  router.push(path);
};
</script>

<style lang="scss" scoped>
.enterprise-home {
  color: var(--carbon-ink);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.status-card {
  display: grid;
  gap: 8px;
  padding: 16px;
  border: 1px solid #eef0f3;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(31, 45, 61, 0.025), 0 6px 18px -10px rgba(31, 45, 61, 0.06);
}

.status-card span {
  color: var(--carbon-muted);
  font-size: 13px;
}

.status-card strong {
  color: var(--carbon-ink);
  font-size: 24px;
  line-height: 1;
}

.status-card em {
  font-size: 12px;
  font-style: normal;
}

.status-card .ok,
.todo-row .ok {
  color: var(--carbon-success);
}

.status-card .warn,
.todo-row .warn {
  color: var(--carbon-warning);
}

.status-card .info,
.todo-row .info {
  color: var(--carbon-primary);
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.action-card {
  min-height: 126px;
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 8px;
  align-content: start;
  padding: 16px;
  border: 1px solid var(--carbon-soft-line);
  border-radius: 8px;
  background: #fff;
  color: var(--carbon-text);
  text-align: left;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(31, 45, 61, 0.025), 0 6px 18px -10px rgba(31, 45, 61, 0.06);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.action-card:hover {
  border-color: rgba(31, 143, 106, 0.4);
  box-shadow: 0 12px 28px -18px rgba(31, 143, 106, 0.45);
  transform: translateY(-1px);
}

.action-icon {
  width: 34px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgba(31, 143, 106, 0.12);
  color: var(--carbon-primary);
  font-size: 12px;
  font-weight: 800;
}

.action-card strong {
  color: var(--carbon-ink);
  font-size: 15px;
}

.action-card em {
  color: var(--carbon-muted);
  font-size: 12px;
  font-style: normal;
  line-height: 1.5;
}

.home-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.todo-list {
  display: grid;
  gap: 0;
}

.todo-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 18px;
  border-bottom: 1px solid var(--carbon-soft-line);
  color: var(--carbon-text);
}

.todo-row:last-child {
  border-bottom: 0;
}

.todo-row span {
  font-weight: 600;
}

.todo-row em {
  color: var(--carbon-muted);
  font-style: normal;
  text-align: right;
}

@media (max-width: 1200px) {
  .status-grid,
  .action-grid,
  .home-columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .status-grid,
  .action-grid,
  .home-columns {
    grid-template-columns: 1fr;
  }

  .todo-row {
    display: grid;
  }

  .todo-row em {
    text-align: left;
  }
}
</style>
