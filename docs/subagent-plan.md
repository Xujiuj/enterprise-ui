# Subagent Plan: Enterprise UI

Updated: 2026-06-05

## Overview

This plan decomposes enterprise-ui missing work into route cleanup, License UI, activity validation UX, import UX, and report template guidance. Frontend tasks must not redefine portal ownership; use this plan and the local spec as the source of truth.

## Architecture Decisions

- Enterprise UI owns 01-05 local workflows and License runtime UX.
- Enterprise UI does not own vendor operations or renewal/payment workflows.
- Server validation is authoritative for activity data.
- Report guidance points to enterprise SQL Server `rpt`, never vendor data.

## Phase 1: Portal Cleanup

### Task EU-1: Remove Vendor-Owned Menu and Routes

**Description:** Clean enterprise-ui route/menu surface so vendor-owned pages are not visible business entries.

**Acceptance criteria:**
- [ ] Customer management, License signing, vendor factor governance, template distribution, and renewal/payment pages are removed from visible enterprise menus.
- [ ] Route/error infrastructure remains available as infrastructure only.
- [ ] Home/workbench still loads.

**Verification:**
- [ ] `rtk npm run build:prod`
- [ ] Manual menu scan in browser.

**Dependencies:** None

**Files likely touched:**
- `src/router/**`
- `src/views/**`
- `src/layout/**`

**Estimated scope:** M

## Phase 2: License Runtime UX

### Task EU-2: License Import API Client

**Description:** Add typed API client for enterprise License import and current/gate status.

**Acceptance criteria:**
- [ ] Client supports `POST /enterprise/license-import/import`.
- [ ] Client supports current License state and gate status endpoints.
- [ ] No request field allows public-key override.

**Verification:**
- [ ] `rtk npm run lint:eslint`
- [ ] `rtk npm run build:prod`

**Dependencies:** None

**Estimated scope:** S

### Task EU-3: License Import and Status Page

**Description:** Build enterprise License import/runtime status page.

**Acceptance criteria:**
- [ ] User can submit `.lic` content.
- [ ] Runtime status displays sanitized business state.
- [ ] Gate denial reasons are user-readable.

**Verification:**
- [ ] `rtk npm run build:prod`
- [ ] Manual form test with mocked or dev backend response.

**Dependencies:** EU-2

**Estimated scope:** M

## Phase 3: Activity Data UX

### Task EU-4: `emission_activity` Normal Entry Form

**Description:** Build the activity data form for the semantic emission activity contract.

**Acceptance criteria:**
- [ ] Online entry exposes only entry fields.
- [ ] Derived fields are resolved by the backend and not shown as editable/importable fields.
- [ ] Editable fields match the entry contract.
- [ ] Strong errors and weak warnings render distinctly.

**Verification:**
- [ ] `rtk npm run build:prod`
- [ ] Manual form check.

**Dependencies:** Enterprise backend validation endpoint preferred

**Estimated scope:** M

### Task EU-5: Activity Import Result View

**Description:** Add Excel import UI and row/column validation result display.

**Acceptance criteria:**
- [ ] User can upload the frozen 18-column Excel shape.
- [ ] Row and column errors display clearly.
- [ ] Derived-field mismatch is shown as blocking.

**Verification:**
- [ ] `rtk npm run build:prod`
- [ ] Manual import with valid and invalid sample files.

**Dependencies:** EU-4 and enterprise import API

**Estimated scope:** M

## Phase 4: Report Template Guidance

### Task EU-6: Report Template Download Page

**Description:** Build download-only report template page with Power BI connection guidance.

**Acceptance criteria:**
- [ ] User can see/download approved templates.
- [ ] Page displays enterprise SQL Server `rpt` guidance.
- [ ] No vendor database source is shown for enterprise business reporting.

**Verification:**
- [ ] `rtk npm run build:prod`
- [ ] Manual page check.

**Dependencies:** Backend template endpoint or mock contract

**Estimated scope:** M

## Checkpoint

After EU-1, EU-3, EU-5, EU-6:

- [ ] `rtk npm run lint:eslint`
- [ ] `rtk npm run build:prod`
- [ ] Browser smoke test for menu, License page, activity page, and report page.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Cleanup deletes shared infrastructure | Medium | Keep route/error pages as infrastructure only |
| UI trusts derived fields | High | Backend validation remains authoritative |
| Report page points to vendor data | High | Spec forbids vendor database source |
| API not ready | Medium | Use typed mock contract, then swap to backend endpoint |

## Parallelization

- EU-1 and EU-2 can run in parallel.
- EU-3 waits for EU-2.
- EU-4 can start with mock validation contract.
- EU-5 waits for import API.
- EU-6 can run independently once template endpoint contract exists.
