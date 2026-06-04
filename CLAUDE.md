# 企业碳数据管理平台 — 前端（plus-ui）开发约定

> 本文件是**企业端前端项目级**开发约定，Claude Code 在 `D:\project\fx\enterprise-ui` 工作时自动加载。
> 基座 **plus-ui**（RuoYi-Vue-Plus 官方前端，版本 5.6.1-2.6.1，对齐后端 v5.6.1；分支 `ts`）。
> 全局总纲见上级 `../CLAUDE.md`；需求与设计依据见 `../docs/`；**UI/交互/视觉基准见 `../html-prototype/`（风格规范以原型为准）**。

## 一、回复语言

始终使用**中文**回复。

## 二、全局差异化约束（写代码前必读，详见 ../docs/01、../docs/02）

1. **数据库统一 SQL Server**：前端无感，但导出/分页参数遵循后端约定。
2. **双端同入口**：厂商端 vendor + 企业端 enterprise 共享同一套代码与登录页，按角色 `portal` 渲染不同菜单/路由；**同名动作必须按 portal 分流**，避免串台（原型已用 `data-portal` 验证）。
3. **License 体系（前端侧）**：导入 `.lic`、展示验签/有效期/设备指纹/续费指引；RSA 相关用 `jsencrypt`；过期弹窗引导续费。
4. **私有化单体部署**：前端打包为静态资源随后端一体交付。
5. **自定义扩展字段仅限三模块**（活动数据 / 绿电绿证 / 强度分母）：扩展列由元数据驱动动态渲染，其余模块表单字段固定。
6. **Power BI 为外部软件**：报表模块只做 `.pbix` 模板下载 + rpt/因子 API 连接参数清单展示，不内嵌 PBI。
7. **维度字段不可自由输入**：能下拉的下拉、能带出的带出（关联字段联动），禁止手填。
8. 全站**非衬线字体**，优先 **OPPOSans**。

## 三、风格规范以原型为准（`../html-prototype/`）

前端实现的 **UI 布局、交互范式、视觉风格、动作闭环命名**以原型为基准，不得自行另起一套：

- **视觉/交互参照**：`ruoyi-style.css`、`ruoyi-style.js`、`ruoyi-icons.js`（若依式风格）。
- **页面与范围**：`enterprise-admin.html` / `vendor-admin.html` / `*-login.html`、`prototype-scope.md`（双端模块清单与边界）。
- **动作键命名沿用原型**：`license:verify|import|contact`、`entry:import|edit|save`、`query:export`、`factor:sync`、`tpl:preview|download|publish|distribute`、`rpt:copy|reset-pwd`、`customer:create`、`user:*|role:*|menu:*`；动作路由按 `data-portal`（vendor/enterprise）分流。
- **交互定式**：列表页（搜索栏 + 批量删除联动 + 分页）；新增/编辑/签发/续签**统一走侧栏抽屉表单**，不跳页；开关切换有 toast 反馈。
- **每业务页头部**保留"用途 / 是否需填报 / 如何填"说明区。

## 四、技术栈（以 package.json 为准，勿擅自升降级）

| 领域 | 选型 | 版本 |
|---|---|---|
| 框架 | Vue | 3.5.30（`<script setup>` 组合式 API） |
| 语言 | TypeScript | ~5.9.3 |
| 构建 | Vite | 7.3.2 |
| UI 库 | Element Plus | 2.13.5（+ `@element-plus/icons-vue`） |
| 表格 | vxe-table | 4.18.1 |
| 状态 | Pinia | 3.0.4 |
| 路由 | vue-router | 5.0.3 |
| HTTP | axios | 1.13.6 |
| 国际化 | vue-i18n | 11.3.0 |
| 原子化 CSS | UnoCSS | 66.6.6 |
| 样式 | Sass | 1.98.0 |
| 图表 | ECharts | 6.0.0 |
| 加解密 | crypto-js 4.2 / jsencrypt 3.5（License RSA 验签） |
| 代码规范 | ESLint 9 + Prettier 3.8 |
| 单测 | Vitest | 4.0.18 |
| 运行环境 | Node ≥ 20.19.0 |

常用脚本：`npm run dev`（开发）、`npm run build:prod`（生产构建）、`npm run lint:eslint:fix`、`npm run prettier`。

## 五、目录结构

```
plus-ui/
├── src/
│   ├── api/{模块}/        接口请求（按模块分目录，TS）
│   ├── views/{模块}/      页面（system/monitor/tool/workflow/demo...）
│   ├── components/        通用组件
│   ├── layout/            布局（侧栏/顶栏/标签页）
│   ├── store/modules/     Pinia 状态（user/permission/dict/app...）
│   ├── router/            路由
│   ├── directive/         指令（如 v-hasPermi）
│   ├── hooks/ utils/      组合式函数 / 工具
│   ├── enums/ types/      枚举 / 类型定义
│   ├── lang/              i18n 语言包
│   └── plugins/ assets/   插件 / 静态资源
├── vite/ vite.config.ts   构建配置
└── public/ html/          静态与模板
```

本项目新增业务（5 大碳数据域、License、因子库、报表模板等）：`api/{模块}/` + `views/{模块}/` 成对新增，与后端 `org.dromara.{module}` 对齐。

## 六、编码风格（以 .prettierrc / .editorconfig / ESLint 为准）

- **缩进 2 空格**；UTF-8；行尾 LF；文件结尾留空行。
- **单引号**、**语句结尾加分号**、`trailingComma: none`、`printWidth: 150`、`arrowParens: always`。
- 组件统一 **`<script setup lang="ts">`** + 组合式 API；命名用 `unplugin-vue-setup-extend-plus` 支持 `name`。
- **接口请求**集中在 `src/api/{模块}/*.ts`，用封装的 `request`（axios 实例），返回类型显式声明；勿在组件内直接拼 axios。
- **状态**用 Pinia（`store/modules/*.ts`，`defineStore`），勿滥用全局变量。
- **权限**：按钮级用指令 `v-hasPermi="['模块:资源:动作']"`，与后端 `@SaCheckPermission` 权限标识一一对齐；菜单/数据范围走后端下发。
- **图标**：Element Plus 图标或 `unplugin-icons`；**字体优先 OPPOSans**，全站非衬线。
- 提交前跑 `lint:eslint:fix` + `prettier`，保持与基座一致。

## 七、查找代码（CodeGraph）

本仓库已建立**独立 CodeGraph 索引**（仓库内 `.codegraph/`）。结构性问题（组件/接口/store 谁调谁、定义在哪、改动影响面）优先用 `codegraph_*` 工具；字面文本/样式/文案检索才用 grep。详见全局 `~/.claude/CLAUDE.md` 的 CodeGraph 段。
