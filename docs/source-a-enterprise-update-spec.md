# Spec: Source(A)-Driven Enterprise Carbon Data Update

## Objective
Update the enterprise-side carbon data platform so Source(A) sample workbooks drive the database model, page content, filters, and validation flow. Enterprise pages must be readable to business users, must not expose internal primary-key wording, and must keep all dimension-like fields controlled by dropdowns or automatic derivation. Vendor-side data remains isolated: vendor provides only template/factor/report-support data required by `意见反馈20260602.md`; enterprise internal operational data is not exposed to vendor pages or databases.

## Tech Stack
- Backend: RuoYi-Vue-Plus, Java 17, Spring Boot, MyBatis-Plus, SQL Server.
- Frontend: Vue 3, Vite, TypeScript, Element Plus.
- Data source: `source（A）/*.xlsx` workbooks and `意见反馈20260602.md`.

## Commands
- Frontend type/build check: `rtk npm run build:dev` from `enterprise-ui`.
- Frontend unit tests: `rtk npm run test:unit -- --runInBand` from `enterprise-ui` when focused tests exist.
- Backend compile check: `rtk mvn -pl ruoyi-modules/carbon-enterprise -am -DskipTests compile` from `enterprise-backend`.
- Backend tests: `rtk mvn -pl ruoyi-modules/carbon-enterprise -am test` from `enterprise-backend` when backend Java changes are made.

## Project Structure
- `enterprise-backend/ruoyi-modules/carbon-enterprise/`: enterprise-only SQL Server schema hardening and business APIs.
- `enterprise-backend/ruoyi-modules/carbon-enterprise/`: RuoYi-generated enterprise business APIs and extensions.
- `enterprise-ui/src/views/enterprise/`: enterprise carbon data pages.
- `enterprise-ui/src/api/enterprise/`: enterprise API clients.
- `enterprise-ui/src/utils/enterpriseFieldOptions.ts`: controlled dropdown option loading.
- `source（A）/`: original sample Excel files.

## Code Style
Prefer configuration-driven RuoYi pages and existing helpers over new abstractions.

```ts
const loadFactoryOptions = () =>
  loadDimensionOptions('company', (record) => ({
    label: [record.recordCode, record.recordName].filter(Boolean).join(' / '),
    value: record.recordCode,
    record
  }));
```

## Testing Strategy
- Preserve existing generated CRUD/API shapes.
- Verify SQL syntax and relational intent by reviewing schema constraints and generated seed statements.
- Run frontend build/type checks for Vue/TypeScript changes.
- Run backend compile when Java backend files are changed. SQL Server schema changes are verified through migration-runner review and backend build/test.

## Boundaries
- Always: keep enterprise data in the enterprise database; keep vendor data out of enterprise operational tables; use dropdowns/auto-fill for dimension fields; hide `PK_`, `FK_`, and raw `id` wording from user-facing labels.
- Ask first: add dependencies, change authentication/license behavior, write to a live non-local database.
- Never: write enterprise business data into the vendor database, expose enterprise internal activity/company data to vendor pages, remove original Excel-required fields from import templates.

## Success Criteria
- Source(A) table relationships are represented by normalized enterprise tables and enforceable SQL Server keys.
- Controlled dropdowns are sourced from concrete business-table projections, not a generic `ce_dimension_record` compatibility table.
- User-facing enterprise pages use business labels such as "工厂", "排放源分类", and "排放源编号" instead of raw primary-key/foreign-key wording.
- Activity data entry keeps Source(A) original import headers, but the visible form guides users through selecting a source and deriving company/category/unit/factor fields.
- Seed SQL is regenerated from the original Excel files with UTF-8 Chinese text, replacing the previous mojibake sample data.
- Vendor-side scope remains template/factor/report-support only; no enterprise internal company/activity rows are added to vendor files.

## Open Questions
- Local SQL Server availability is environment-specific; connection details must stay outside YAML and be supplied by deployment configuration.
- RuoYi code generation should be used for any new Java CRUD surface. This change avoids new Java CRUD where existing generated APIs/config pages already cover the surface.
