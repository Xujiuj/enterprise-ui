import type { RouteRecordRaw } from 'vue-router';

type PortalRoute = RouteRecordRaw & {
  permissions?: string | string[];
  perms?: string | string[];
  children?: PortalRoute[];
  hidden?: boolean;
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
  /字典管理|参数设置|通知公告|文件管理|文件配置管理|部门管理|岗位管理|在线用户|缓存监控|代码生成|系统工具|PLUS官网|测试菜单/
];

export const enterpriseAllowedPermissionPrefixes = ['enterprise:', 'system:', 'monitor:'];

const enterpriseTopLevelOrder = [
  'system-auth',
  'emission-source-config',
  'factor-confirm',
  'activity-data',
  'green-electricity',
  'intensity',
  'report-management',
  'system',
  'log'
];

const enterpriseAllowedTopLevelPaths = new Set(enterpriseTopLevelOrder);

const enterpriseAllowedTopLevelTitles = new Set([
  '首页',
  '系统授权',
  '1 配置排放源',
  '01 配置排放源',
  '2 确认排放因子',
  '02 确认排放因子',
  '3 活动数据',
  '03 活动数据',
  '4 绿电绿证',
  '04 绿电绿证',
  '5 强度管理',
  '05 强度管理',
  '报表管理',
  '系统管理',
  '日志'
]);

const enterpriseCanonicalTopLevelTitles = new Map([
  ['system-auth', '系统授权'],
  ['emission-source-config', '1 配置排放源'],
  ['factor-confirm', '2 确认排放因子'],
  ['activity-data', '3 活动数据'],
  ['green-electricity', '4 绿电绿证'],
  ['intensity', '5 强度管理'],
  ['report-management', '报表管理'],
  ['system', '系统管理'],
  ['log', '日志']
]);

const enterpriseTopLevelAliases = new Map([
  ['首页', 'index'],
  ['工作台', 'index'],
  ['系统授权', 'system-auth'],
  ['授权管理', 'system-auth'],
  ['1 配置排放源', 'emission-source-config'],
  ['01 配置排放源', 'emission-source-config'],
  ['配置排放源', 'emission-source-config'],
  ['2 确认排放因子', 'factor-confirm'],
  ['02 确认排放因子', 'factor-confirm'],
  ['确认排放因子', 'factor-confirm'],
  ['3 活动数据', 'activity-data'],
  ['03 活动数据', 'activity-data'],
  ['活动数据', 'activity-data'],
  ['4 绿电绿证', 'green-electricity'],
  ['04 绿电绿证', 'green-electricity'],
  ['绿电绿证', 'green-electricity'],
  ['5 强度管理', 'intensity'],
  ['05 强度管理', 'intensity'],
  ['强度管理', 'intensity'],
  ['报表管理', 'report-management'],
  ['系统管理', 'system'],
  ['日志', 'log'],
  ['日志管理', 'log']
]);

const enterpriseAllowedVisibleChildPathsByScope = new Map<string, string[]>([
  ['system-auth', ['license-import']],
  ['emission-source-config', ['admin-division', 'company', 'emission-source-category', 'emission-source', 'base-year']],
  ['factor-confirm', ['ef-factor', 'ef-electricity-factor', 'ef-electricity-version', 'ef-electricity-scope', 'greenhouse-gas']],
  ['activity-data', ['emission-activity-data']],
  ['green-electricity', ['green-electricity-data']],
  ['intensity', ['intensity-denominator', 'intensity-target', 'denominator-fact', 'intensity-tolerance']],
  ['report-management', ['content', 'powerbi-report', 'data-validation', 'report-template-download']],
  ['system', ['user', 'role', 'menu', 'extension-field']],
  ['log', ['operlog', 'logininfor']]
]);

const enterpriseCanonicalChildTitlesByScope = new Map<string, Map<string, string>>([
  ['system-auth', new Map([['license-import', '授权管理']])],
  [
    'emission-source-config',
    new Map([
      ['admin-division', '101 行政区划'],
      ['company', '102 公司表'],
      ['emission-source-category', '103 排放源分类'],
      ['emission-source', '104 排放源识别'],
      ['base-year', '106 基准年维度表']
    ])
  ],
  [
    'factor-confirm',
    new Map([
      ['ef-factor', '201 EF排放因子维度表'],
      ['ef-electricity-factor', '202 EF电力因子维度表'],
      ['ef-electricity-version', '203 EF电力因子版本对应'],
      ['ef-electricity-scope', '205 EF电力因子口径维度'],
      ['greenhouse-gas', '206 温室气体维度']
    ])
  ],
  ['activity-data', new Map([['emission-activity-data', '排放活动数据']])],
  ['green-electricity', new Map([['green-electricity-data', '401 绿电绿证数据']])],
  [
    'intensity',
    new Map([
      ['intensity-denominator', '501 碳排放强度分母维度表'],
      ['intensity-target', '502 强度目标表'],
      ['denominator-fact', '503 分母事实表'],
      ['intensity-tolerance', '504 碳排放强度容忍率参数表']
    ])
  ],
  [
    'report-management',
    new Map([
      ['content', 'Content'],
      ['powerbi-report', '温室气体核算报表'],
      ['data-validation', '数据验证'],
      ['report-template-download', '报表模板下载']
    ])
  ],
  [
    'system',
    new Map([
      ['user', '用户管理'],
      ['role', '角色管理'],
      ['menu', '菜单管理'],
      ['extension-field', '扩展字段配置']
    ])
  ],
  [
    'log',
    new Map([
      ['operlog', '操作日志'],
      ['logininfor', '登录日志']
    ])
  ]
]);

const enterpriseLegacyChildTitleAliasesByScope = new Map<string, Map<string, string>>([
  [
    'emission-source-config',
    new Map([
      ['行政区划', 'admin-division'],
      ['公司表', 'company'],
      ['排放源分类', 'emission-source-category'],
      ['排放源识别', 'emission-source'],
      ['基准年维度表', 'base-year']
    ])
  ],
  [
    'factor-confirm',
    new Map([
      ['EF排放因子维度表', 'ef-factor'],
      ['EF电力因子维度表', 'ef-electricity-factor'],
      ['EF电力因子版本对应', 'ef-electricity-version'],
      ['EF电力因子口径维度', 'ef-electricity-scope'],
      ['温室气体维度', 'greenhouse-gas']
    ])
  ],
  ['green-electricity', new Map([['绿电绿证数据', 'green-electricity-data']])],
  [
    'intensity',
    new Map([
      ['碳排放强度分母维度表', 'intensity-denominator'],
      ['强度目标表', 'intensity-target'],
      ['分母事实表', 'denominator-fact'],
      ['碳排放强度容忍率参数表', 'intensity-tolerance']
    ])
  ]
]);

const enterpriseChildPathAliasesByScope = new Map<string, Map<string, string>>(
  [...enterpriseCanonicalChildTitlesByScope.entries()].map(([scope, titleMap]) => [
    scope,
    new Map([
      ...[...titleMap.entries()].flatMap<[string, string]>(([path, title]) => [
        [path, path],
        [title, path]
      ]),
      ...(enterpriseLegacyChildTitleAliasesByScope.get(scope)?.entries() ?? [])
    ])
  ])
);

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
  if (
    title === 'EF电力因子版本对应' ||
    title === '203 EF电力因子版本对应' ||
    title === 'EF电力因子口径维度' ||
    title === '205 EF电力因子口径维度'
  ) {
    return false;
  }
  return enterpriseForbiddenMenuTitlePatterns.some((pattern) => pattern.test(title));
}

export function filterEnterprisePortalRoutes(routeMap: PortalRoute[]): RouteRecordRaw[] {
  return sortPortalRoutes(promoteLogRoute(filterEnterprisePortalRouteTree(routeMap, 'root')), 'root');
}

function filterEnterprisePortalRouteTree(routeMap: PortalRoute[], scope: string): RouteRecordRaw[] {
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
    if (resolveTopLevelRouteKey(route as PortalRoute) !== 'system' || !route.children) {
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
          alwaysShow: true,
          children: sortPortalRoutes((child.children ?? []) as RouteRecordRaw[], 'log'),
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
      children: sortPortalRoutes(systemChildren, 'system')
    });
  });

  return logRoute ? promotedRoutes.concat(logRoute) : promotedRoutes;
}

function normalizePortalRoute(route: PortalRoute, scope: string, children?: RouteRecordRaw[]): RouteRecordRaw {
  const routeKey = scope === 'root' ? resolveTopLevelRouteKey(route) : resolveChildRouteKey(route, scope);
  const normalizedRoute = {
    ...route,
    ...(children ? { children: sortPortalRoutes(children, routeKey) } : {})
  } as RouteRecordRaw;

  if (scope === 'root') {
    normalizedRoute.path = normalizeTopLevelPath(resolveTopLevelRouteKey(normalizedRoute));
    normalizedRoute.alwaysShow = true;
    normalizedRoute.meta = {
      ...(normalizedRoute.meta ?? {}),
      title: enterpriseCanonicalTopLevelTitles.get(normalizeRouteIdentifier(normalizedRoute.path)) ?? normalizedRoute.meta?.title
    };
    return normalizedRoute;
  }

  const canonicalChildTitle = enterpriseCanonicalChildTitlesByScope.get(scope)?.get(routeKey);
  if (canonicalChildTitle) {
    normalizedRoute.path = routeKey;
    normalizedRoute.meta = {
      ...(normalizedRoute.meta ?? {}),
      title: canonicalChildTitle
    };
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

function getChildScope(route: PortalRoute, scope: string): string {
  const normalizedPath = resolveTopLevelRouteKey(route);
  const title = String(route.meta?.title ?? '');
  if (normalizedPath === 'system' || title === '系统管理') {
    return 'system';
  }
  if (normalizedPath === 'log' || title === '日志' || title === '日志管理') {
    return 'log';
  }
  if (scope === 'root') {
    return normalizedPath;
  }
  return scope;
}

function isAllowedByEnterprisePortalContract(route: PortalRoute, scope: string): boolean {
  const normalizedPath = scope === 'root' ? resolveTopLevelRouteKey(route) : resolveChildRouteKey(route, scope);
  const title = String(route.meta?.title ?? '');

  if (scope === 'root') {
    return enterpriseAllowedTopLevelPaths.has(normalizedPath) || enterpriseAllowedTopLevelTitles.has(title);
  }

  if (isHiddenRoute(route)) {
    return true;
  }

  if (scope === 'system' && (normalizedPath === 'log' || title === '日志' || title === '日志管理')) {
    return true;
  }

  const visibleChildPaths = enterpriseAllowedVisibleChildPathsByScope.get(scope);
  if (!visibleChildPaths) {
    return true;
  }

  return (
    visibleChildPaths.includes(normalizedPath) ||
    visibleChildPaths.some((path) => enterpriseCanonicalChildTitlesByScope.get(scope)?.get(path) === title)
  );
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

function sortPortalRoutes(routes: RouteRecordRaw[], scope: string): RouteRecordRaw[] {
  const order = scope === 'root' ? enterpriseTopLevelOrder : (enterpriseAllowedVisibleChildPathsByScope.get(scope) ?? []);
  if (!order.length) {
    return routes;
  }

  return [...routes].sort((left, right) => routeOrder(left, order) - routeOrder(right, order));
}

function routeOrder(route: RouteRecordRaw, order: string[]): number {
  const normalizedPath = routeOrderKey(route, order);
  const index = order.indexOf(normalizedPath);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function routeOrderKey(route: RouteRecordRaw, order: string[]): string {
  const topLevelKey = resolveTopLevelRouteKey(route as PortalRoute);
  if (order.includes(topLevelKey)) {
    return topLevelKey;
  }
  for (const scope of enterpriseAllowedVisibleChildPathsByScope.keys()) {
    const childKey = resolveChildRouteKey(route as PortalRoute, scope);
    if (order.includes(childKey)) {
      return childKey;
    }
  }
  return normalizeRouteIdentifier(route.path);
}

function resolveTopLevelRouteKey(route: PortalRoute): string {
  const title = String(route.meta?.title ?? '');
  return enterpriseTopLevelAliases.get(title) ?? normalizeRouteIdentifier(route.path);
}

function resolveChildRouteKey(route: PortalRoute, scope: string): string {
  const pathKey = normalizeRouteIdentifier(route.path);
  const title = String(route.meta?.title ?? '');
  const aliases = enterpriseChildPathAliasesByScope.get(scope);
  return aliases?.get(pathKey) ?? aliases?.get(title) ?? pathKey;
}

function isHiddenRoute(route: PortalRoute): boolean {
  return route.hidden === true;
}
