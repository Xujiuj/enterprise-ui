# Spec: Enterprise UI Missing Features

Updated: 2026-06-05

## Objective

Finish the enterprise-side portal for local enterprise users. The UI owns the 01-05 enterprise workflows, License import/runtime status, data validation UX, report template download, and Power BI connection guidance. It must not expose vendor operations such as customer management, License signing, factor version governance, template distribution, renewal management, or payment operations.

Current baseline:

- The project is a split `enterprise-ui` repository.
- Frontend portal ownership has been frozen.
- Backend License import/current state and License gate APIs exist.
- Activity `sheet_656` field mapping is frozen for the first validation/import slice.
- Power BI connection runbook is frozen at backend/root-doc level.

## Tech Stack

- Vue 3.5.30
- Vite 7.3.2
- TypeScript 5.9.x
- Element Plus 2.13.5
- Pinia 3.0.4
- Vue Router 5.0.3
- ECharts 6.0.0

## Commands

Run from `enterprise-ui`.

```powershell
rtk npm run dev
rtk npm run build:prod
rtk npm run build:dev
rtk npm run lint:eslint
rtk npm run preview
```

## Project Structure

```text
src/                  Vue application source
src/api/              API clients
src/views/            Route-level pages
src/components/       Shared UI components
src/router/           Route definitions and guards
src/store/            Pinia stores
public/               Static assets
docs/                 Enterprise UI specs and task plans
```

## Missing Features

### EU-1: Enterprise Portal Cleanup

Remove vendor-owned business surfaces from enterprise-ui.

Enterprise keeps:

- Home/workbench
- License import
- Current License runtime status
- 01 emission source configuration
- 02 emission factor confirmation
- 03 activity data
- 04 green electricity certificate
- 05 intensity management
- Custom field metadata for allowed enterprise modules
- Data validation/submission/c催办
- Report template download and connection guidance
- Portal-local system management and logs

Enterprise removes:

- Customer management
- License signing/renewal/revoke operations
- Vendor factor version governance pages
- Template distribution
- Renewal/payment management pages, workflows, and API clients
- RuoYi infrastructure pages outside the product contract, except route/error infrastructure.

### EU-2: License Import and Runtime Status Page

Requirements:

- Connect to `POST /enterprise/license-import/import`.
- Connect to current License state and gate status endpoints.
- Show business states without exposing internal entity fields.
- Show gate denial reasons using stable messages:
  - no valid license
  - clock rollback
  - expired
  - install ID mismatch
- Do not allow users to upload public keys or choose verification keys.

### EU-3: Activity `sheet_656` Entry and Validation UX

Requirements:

- Implement first activity template UX for `03-活动数据` / `天然气` / `sheet_656`.
- `f001` is selected from emission-source master data.
- Derived fields `f002-f010` and `f018` are display-only.
- Editable fields:
  - `f011` year
  - `f012` month
  - `f013` date
  - `f014` activity data
  - `f015` responsible department
  - `f016` data source
  - `f017` remark
- Strong errors block submit.
- Weak warnings are visible but do not block draft save.

### EU-4: Activity Import UX

Requirements:

- Accept Excel files with the frozen 18-column `sheet_656` shape.
- Show row and column names for validation failures.
- Show derived-field mismatch as strong errors.
- Do not let the browser overwrite server-derived fields.

### EU-5: Report Template Download and Power BI Guidance

Requirements:

- Enterprise users may download approved `.pbix` templates.
- UI may display SQL Server connection placeholders supplied by enterprise deployment.
- UI must explain that Power BI connects to enterprise SQL Server `rpt` only.
- UI must not configure or suggest vendor database as an enterprise business data source.

## Code Style

Use Vue SFC and existing project conventions:

```vue
<script setup lang="ts">
import { ref } from 'vue';

const loading = ref(false);

async function submit() {
  loading.value = true;
  try {
    // API client owns request shape; component owns UI state.
  } finally {
    loading.value = false;
  }
}
</script>
```

Conventions:

- API clients live under `src/api`.
- Pages live under `src/views`.
- Route-level ownership must follow this spec.
- Do not use visible copy that describes implementation details or internal architecture.

## Testing Strategy

- Build verification with `npm run build:prod`.
- ESLint verification with `npm run lint:eslint`.
- Component/unit tests may be added for validation helpers.
- Manual browser verification is required for major page cleanup or new forms.

## Boundaries

- Always:
  - Keep enterprise-local workflows in enterprise-ui only.
  - Treat backend validation as authoritative.
  - Show row/column validation errors clearly.
  - Keep report guidance limited to enterprise SQL Server `rpt`.
- Ask first:
  - New dependencies.
  - Route/menu architecture changes outside frozen contract.
  - Adding payment/renewal screens.
- Never:
  - Show vendor customer management.
  - Show License signing/revoke/renewal operations.
  - Display enterprise runtime state in vendor-style pages.
  - Trust frontend-derived activity fields over backend results.

## Success Criteria

- Vendor-owned routes are removed or hidden from enterprise menus.
- License import/status page works against enterprise backend APIs.
- `sheet_656` normal form and import UX reflect the frozen mapping.
- Report template page downloads templates and displays safe connection guidance.
- `npm run build:prod` passes.

## Open Questions

- Which backend endpoint will provide production install ID to the UI?
- Which endpoint will list approved report templates and connection parameters?
- Should weak validation warnings block final submit or only draft save?
