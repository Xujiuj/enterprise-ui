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
  /企业本地业务/,
  /客户档案|客户管理|租户管理/,
  /License\s*(签发|续签|吊销|作废|生命周期)/i,
  /(签发|续签|吊销|作废|生命周期)\s*License/i,
  /模板(库|管理|分发|上传|发布)/,
  /续费|支付|订单/,
  /厂商.*因子|因子.*(库管理|版本|版本治理|版本管控|标准库)/,
  /部门管理|岗位管理|字典管理|参数设置|通知公告|文件管理|文件配置管理|在线用户|缓存监控|代码生成|系统工具|PLUS官网|测试菜单/
];

export const enterpriseAllowedPermissionPrefixes = ['enterprise:', 'system:', 'monitor:'];

const enterpriseAllowedTopLevelPaths = new Set([
  'system-auth',
  'emission-source-config',
  'factor-confirm',
  'activity-data',
  'green-electricity',
  'intensity',
  'report-management',
  'system',
  'log'
]);

const enterpriseAllowedTopLevelTitles = new Set([
  '系统授权',
  '配置排放源',
  '确认排放因子',
  '活动数据',
  '绿电绿证',
  '强度管理',
  '报表管理',
  '系统管理',
  '日志',
  '日志管理'
]);

const enterpriseAllowedSystemChildPaths = new Set(['user', 'role', 'menu', 'log']);
const enterpriseAllowedSystemChildTitles = new Set(['用户管理', '角色管理', '菜单管理', '日志', '日志管理']);
const enterpriseAllowedLogChildPaths = new Set(['operlog', 'logininfor']);
const enterpriseAllowedLogChildTitles = new Set(['操作日志', '登录日志']);

const enterpriseForbiddenRouteIdentifierPatterns = [
  /(^|\/)(vendor|customer|tenant|tenantpackage|tenant-package|client)(\/|$)/,
  /(^|\/)system\/(license|licensestate|license-state|tenant|tenantpackage|tenant-package|client)(\/|$)/,
  /(^|\/)(license-issue|licenseissue|license-sign|licensesign|license-renew|licenserenew|license-revoke|licenserevoke|license-lifecycle|licenselifecycle)(\/|$)/,
  /(^|\/)(template-scope|templatescope|template-distribution|templatedistribution|renewal-order|renewalorder|payment|order)(\/|$)/,
  /(^|\/)(factor-version|factorversion|factor-scope|factorscope)(\/|$)/
];

const enterpriseForbiddenPermissionPatterns = [
  /^system:(client|tenant|tenantPackage|license|licenseState|factorLibrary|reportTemplate|dept|post|dict|config|notice|oss|ossConfig):/i,
  /^monitor:(online|cache):/i,
  /^tool:/i,
  /^vendor:/i
];

export function isEnterpriseForbiddenMenuTitle(title: string): boolean {
  if (title === 'EF电力因子版本对应' || title === 'EF电力因子口径维度') {
    return false;
  }
  return enterpriseForbiddenMenuTitlePatterns.some((pattern) => pattern.test(title));
}

export function filterEnterprisePortalRoutes(routeMap: PortalRoute[]): RouteRecordRaw[] {
  return promoteLogRoute(filterEnterprisePortalRouteTree(routeMap, 'root'));
}

function filterEnterprisePortalRouteTree(routeMap: PortalRoute[], scope: 'root' | 'enterprise' | 'system' | 'log'): RouteRecordRaw[] {
  return routeMap
    .filter((route) => isAllowedByEnterprisePortalContract(route, scope) && !isEnterpriseForbiddenRoute(route))
    .map((route) => {
      const children = route.children ? filterEnterprisePortalRouteTree(route.children, getChildScope(route, scope)) : undefined;
      return normalizePortalRoute(route, scope, children);
    })
    .filter((route) => !isEmptyRouteShell(route));
}

function promoteLogRoute(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  const promotedRoutes: RouteRecordRaw[] = [];
  let logRoute: RouteRecordRaw | undefined;

  routes.forEach((route) => {
    if (normalizeRouteIdentifier(route.path) !== 'system' || !route.children) {
      promotedRoutes.push(route);
      return;
    }

    const systemChildren = route.children.filter((child) => {
      const title = String(child.meta?.title ?? '');
      const isLogRoute = child.path === 'log' || title === '日志管理' || title === '日志';
      if (isLogRoute) {
        logRoute = {
          ...child,
          path: '/log',
          component: 'Layout',
          meta: {
            ...(child.meta ?? {}),
            title: '日志'
          }
        } as RouteRecordRaw;
      }
      return !isLogRoute;
    });

    promotedRoutes.push({
      ...route,
      children: systemChildren
    });
  });

  return logRoute ? promotedRoutes.concat(logRoute) : promotedRoutes;
}

function normalizePortalRoute(route: PortalRoute, scope: 'root' | 'enterprise' | 'system' | 'log', children?: RouteRecordRaw[]): RouteRecordRaw {
  const normalizedRoute = {
    ...route,
    ...(children ? { children } : {})
  } as RouteRecordRaw;

  if (scope === 'root') {
    normalizedRoute.path = normalizeTopLevelPath(normalizedRoute.path);
  }

  return normalizedRoute;
}

function normalizeTopLevelPath(path: RouteRecordRaw['path']): string {
  const normalizedPath = String(path ?? '').trim();
  if (!normalizedPath || normalizedPath.startsWith('/')) {
    return normalizedPath;
  }
  return `/${normalizedPath}`;
}

function getChildScope(route: PortalRoute, scope: 'root' | 'enterprise' | 'system' | 'log'): 'enterprise' | 'system' | 'log' {
  const normalizedPath = normalizeRouteIdentifier(route.path);
  const title = String(route.meta?.title ?? '');
  if (normalizedPath === 'system' || title === '系统管理') {
    return 'system';
  }
  if (normalizedPath === 'log' || title === '日志' || title === '日志管理') {
    return 'log';
  }
  return scope === 'system' ? 'system' : 'enterprise';
}

function isAllowedByEnterprisePortalContract(route: PortalRoute, scope: 'root' | 'enterprise' | 'system' | 'log'): boolean {
  const normalizedPath = normalizeRouteIdentifier(route.path);
  const title = String(route.meta?.title ?? '');

  if (scope === 'root') {
    return enterpriseAllowedTopLevelPaths.has(normalizedPath) || enterpriseAllowedTopLevelTitles.has(title);
  }

  if (scope === 'system') {
    return enterpriseAllowedSystemChildPaths.has(normalizedPath) || enterpriseAllowedSystemChildTitles.has(title);
  }

  if (scope === 'log') {
    return enterpriseAllowedLogChildPaths.has(normalizedPath) || enterpriseAllowedLogChildTitles.has(title);
  }

  return true;
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
  const normalized = normalizeRouteIdentifier(value);

  return enterpriseForbiddenRouteIdentifierPatterns.some((pattern) => pattern.test(normalized));
}

function normalizeRouteIdentifier(value: unknown): string {
  return String(value ?? '')
    .replace(/\\/g, '/')
    .replace(/\/index$/, '')
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase();
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
