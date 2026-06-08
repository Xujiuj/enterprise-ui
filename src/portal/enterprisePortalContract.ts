import type { RouteRecordRaw } from 'vue-router';

type PortalRoute = RouteRecordRaw & {
  permissions?: string | string[];
  perms?: string | string[];
  children?: PortalRoute[];
  meta?: RouteRecordRaw['meta'] & {
    activeMenu?: string;
    title?: string;
  };
};

export const enterpriseForbiddenMenuTitlePatterns = [
  /客户档案|客户管理|租户管理/,
  /License\s*(管理|授权管理|签发|续签|吊销|作废|生命周期)/i,
  /(签发|续签|吊销|作废|生命周期)\s*License/i,
  /模板(库|管理|分发|上传|发布)/,
  /续费|支付|订单/,
  /厂商.*因子|因子.*(库管理|版本|版本治理|版本管控|标准库)/
];

export const enterpriseAllowedPermissionPrefixes = ['enterprise:', 'system:', 'monitor:', 'tool:gen'];

const enterpriseForbiddenRouteIdentifierPatterns = [
  /(^|\/)(vendor|customer|tenant|tenantpackage|tenant-package|client)(\/|$)/,
  /(^|\/)system\/(license|licensestate|license-state|tenant|tenantpackage|tenant-package|client)(\/|$)/,
  /(^|\/)(license-issue|licenseissue|license-sign|licensesign|license-renew|licenserenew|license-revoke|licenserevoke|license-lifecycle|licenselifecycle)(\/|$)/,
  /(^|\/)(template-scope|templatescope|template-distribution|templatedistribution|renewal-order|renewalorder|payment|order)(\/|$)/,
  /(^|\/)(factor-version|factorversion|factor-scope|factorscope)(\/|$)/
];

const enterpriseForbiddenPermissionPatterns = [
  /^system:(client|tenant|tenantPackage|license|licenseState|factorLibrary|reportTemplate):/i,
  /^vendor:/i
];

export function isEnterpriseForbiddenMenuTitle(title: string): boolean {
  return enterpriseForbiddenMenuTitlePatterns.some((pattern) => pattern.test(title));
}

export function filterEnterprisePortalRoutes(routeMap: PortalRoute[]): RouteRecordRaw[] {
  return routeMap
    .filter((route) => !isEnterpriseForbiddenRoute(route))
    .map((route) => {
      const children = route.children ? filterEnterprisePortalRoutes(route.children) : undefined;
      return {
        ...route,
        ...(children ? { children } : {})
      };
    })
    .filter((route) => !isEmptyRouteShell(route));
}

function isEnterpriseForbiddenRoute(route: PortalRoute): boolean {
  const routeIdentifiers = [route.path, route.name, route.component, route.redirect, route.meta?.activeMenu];
  const title = String(route.meta?.title ?? '');

  return (
    routeIdentifiers.some((value) => matchesForbiddenRouteIdentifier(value)) ||
    isEnterpriseForbiddenMenuTitle(title) ||
    hasForbiddenPermission(route.permissions) ||
    hasForbiddenPermission(route.perms)
  );
}

function matchesForbiddenRouteIdentifier(value: unknown): boolean {
  const normalized = String(value ?? '')
    .replace(/\\/g, '/')
    .replace(/\/index$/, '')
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase();

  return enterpriseForbiddenRouteIdentifierPatterns.some((pattern) => pattern.test(normalized));
}

function hasForbiddenPermission(value: unknown): boolean {
  const permissions = Array.isArray(value) ? value : String(value ?? '').split(',');
  const normalized = permissions.map((permission) => permission.trim()).filter(Boolean);

  return normalized.some(
    (permission) =>
      enterpriseForbiddenPermissionPatterns.some((pattern) => pattern.test(permission)) ||
      !enterpriseAllowedPermissionPrefixes.some((prefix) => permission.startsWith(prefix))
  );
}

function isEmptyRouteShell(route: PortalRoute): boolean {
  const component = String(route.component ?? '');
  return (component === 'Layout' || component === 'ParentView') && (!route.children || route.children.length === 0);
}
