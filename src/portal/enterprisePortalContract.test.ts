import { describe, expect, it } from 'vitest';
import { enterpriseAllowedPermissionPrefixes, filterEnterprisePortalRoutes, isEnterpriseForbiddenMenuTitle } from './enterprisePortalContract';

const enterpriseWorkbenchRoute = {
  path: '',
  children: [
    {
      path: '/index',
      meta: { title: '工作台' }
    }
  ]
};

describe('enterprise dynamic router guard', () => {
  it('keeps backend returned enterprise menus and removes vendor menus', () => {
    const routes = [
      {
        path: 'report-management',
        component: 'Layout',
        meta: { title: 'report management' },
        children: [
          {
            path: 'report-template-download',
            component: 'enterprise/reportTemplateFile/index',
            meta: { title: 'report template file' },
            permissions: ['enterprise:reportTemplateFile:list']
          },
          {
            path: 'tool-gen',
            component: 'tool/gen/index',
            meta: { title: 'code generation' },
            permissions: ['tool:gen:list']
          },
          {
            path: 'content',
            component: 'enterprise/reports/index',
            meta: { title: 'Power BI content' },
            permissions: ['enterprise:reports:view']
          },
          {
            path: 'data-validation',
            component: 'enterprise/dataValidation/index',
            meta: { title: 'data validation' },
            permissions: ['enterprise:dataValidation:view']
          }
        ]
      },
      {
        path: 'emission-source-config',
        component: 'Layout',
        meta: { title: '配置排放源' },
        children: [
          {
            path: 'emission-source',
            component: 'enterprise/emissionSource/index',
            meta: { title: 'emission source' },
            permissions: ['enterprise:emissionSource:list']
          },
          {
            path: 'admin-division',
            component: 'enterprise/dimension/index',
            meta: { title: 'admin division' },
            permissions: ['enterprise:dimension:view']
          },
          {
            path: 'base-year',
            component: 'enterprise/dimension/index',
            meta: { title: 'base year' },
            permissions: ['enterprise:dimension:view']
          },
          {
            path: 'emission-source-category',
            component: 'enterprise/dimension/index',
            meta: { title: 'category' },
            permissions: ['enterprise:dimension:view']
          },
          {
            path: 'company',
            component: 'enterprise/dimension/index',
            meta: { title: 'company' },
            permissions: ['enterprise:dimension:view']
          },
          {
            path: 'license-issue',
            component: 'system/license/index',
            meta: { title: 'License issue' },
            permissions: ['vendor:licenseIssue:list']
          },
          {
            path: 'template-scope',
            component: 'vendor/templateScope/index',
            meta: { title: 'template scope' },
            permissions: ['vendor:templateScope:list']
          }
        ]
      },
      {
        path: 'system-auth',
        component: 'Layout',
        meta: { title: 'system auth' },
        children: [
          {
            path: 'license-import',
            component: 'enterprise/licenseImport/index',
            meta: { title: 'license import' },
            permissions: ['enterprise:licenseImport:import']
          }
        ]
      },
      {
        path: 'factor-confirm',
        component: 'Layout',
        meta: { title: '确认排放因子' },
        children: [
          {
            path: 'ef-factor',
            component: 'enterprise/dimension/index',
            meta: { title: 'ef factor' },
            permissions: ['enterprise:dimension:view']
          },
          {
            path: 'ef-electricity-factor',
            component: 'enterprise/dimension/index',
            meta: { title: 'ef electricity factor' },
            permissions: ['enterprise:dimension:view']
          },
          {
            path: 'ef-electricity-version',
            component: 'enterprise/dimension/index',
            meta: { title: 'EF电力因子版本对应' },
            permissions: ['enterprise:dimension:view']
          },
          {
            path: 'ef-electricity-scope',
            component: 'enterprise/dimension/index',
            meta: { title: 'EF电力因子口径维度' },
            permissions: ['enterprise:dimension:view']
          },
          {
            path: 'greenhouse-gas',
            component: 'enterprise/dimension/index',
            meta: { title: 'greenhouse gas' },
            permissions: ['enterprise:dimension:view']
          }
        ]
      },
      {
        path: 'activity-data',
        component: 'Layout',
        meta: { title: '活动数据' },
        children: [
          {
            path: 'emission-activity-data',
            component: 'enterprise/activityData/index',
            meta: { title: 'activity data list' },
            permissions: ['enterprise:activityData:list']
          }
        ]
      },
      {
        path: 'green-electricity',
        component: 'Layout',
        meta: { title: '绿电绿证' },
        children: [
          {
            path: 'green-electricity-data',
            component: 'enterprise/greenPowerCertificate/index',
            meta: { title: 'green certificate' },
            permissions: ['enterprise:greenPowerCertificate:list']
          }
        ]
      },
      {
        path: 'intensity',
        component: 'Layout',
        meta: { title: '强度管理' },
        children: [
          {
            path: 'intensity-target',
            component: 'enterprise/intensityMetric/index',
            meta: { title: 'intensity metric' },
            permissions: ['enterprise:intensityMetric:list']
          },
          {
            path: 'intensity-denominator',
            component: 'enterprise/dimension/index',
            meta: { title: 'denominator' },
            permissions: ['enterprise:dimension:view']
          },
          {
            path: 'intensity-tolerance',
            component: 'enterprise/dimension/index',
            meta: { title: 'tolerance' },
            permissions: ['enterprise:dimension:view']
          },
          {
            path: 'denominator-fact',
            component: 'enterprise/dimension/index',
            meta: { title: 'fact' },
            permissions: ['enterprise:dimension:view']
          }
        ]
      },
      {
        path: 'system',
        component: 'Layout',
        meta: { title: '系统管理' },
        children: [
          {
            path: 'user',
            component: 'system/user/index',
            meta: { title: '用户管理' },
            permissions: ['system:user:list']
          },
          {
            path: 'role',
            component: 'system/role/index',
            meta: { title: '角色管理' },
            permissions: ['system:role:list']
          },
          {
            path: 'role-auth/user/:roleId',
            component: 'system/role/authUser',
            hidden: true,
            meta: { title: '分配用户', activeMenu: '/system/role' },
            permissions: ['system:role:edit']
          },
          {
            path: 'user-auth/role/:userId',
            component: 'system/user/authRole',
            hidden: true,
            meta: { title: '分配角色', activeMenu: '/system/user' },
            permissions: ['system:user:edit']
          },
          {
            path: 'menu',
            component: 'system/menu/index',
            meta: { title: '菜单管理' },
            permissions: ['system:menu:list']
          },
          {
            path: 'dept',
            component: 'system/dept/index',
            meta: { title: '部门管理' },
            permissions: ['system:dept:list']
          },
          {
            path: 'post',
            component: 'system/post/index',
            meta: { title: '岗位管理' },
            permissions: ['system:post:list']
          },
          {
            path: 'log',
            component: 'ParentView',
            meta: { title: '日志管理' },
            children: [
              {
                path: 'operlog',
                component: 'monitor/operlog/index',
                meta: { title: '操作日志' },
                permissions: ['monitor:operlog:list']
              },
              {
                path: 'logininfor',
                component: 'monitor/logininfor/index',
                meta: { title: '登录日志' },
                permissions: ['monitor:logininfor:list']
              },
              {
                path: 'online',
                component: 'monitor/online/index',
                meta: { title: '在线用户' },
                permissions: ['monitor:online:list']
              }
            ]
          },
          {
            path: 'license',
            component: 'system/license/index',
            meta: { title: 'License管理' },
            permissions: ['system:license:list']
          },
          {
            path: 'factorLibrary',
            component: 'system/factorLibrary/index',
            meta: { title: '因子库管理' },
            permissions: ['system:factorLibrary:list']
          },
          {
            path: 'reportTemplate',
            component: 'system/reportTemplate/index',
            meta: { title: '报表模板管理' },
            permissions: ['system:reportTemplate:list']
          }
        ]
      },
      {
        path: 'vendor',
        component: 'Layout',
        meta: { title: 'vendor operations' },
        children: [
          {
            path: 'customer',
            component: 'system/tenant/index',
            meta: { title: 'customer archive' },
            permissions: ['vendor:customer:list']
          }
        ]
      },
      {
        path: 'monitor',
        component: 'Layout',
        meta: { title: 'monitor' },
        children: [
          {
            path: 'server',
            component: 'monitor/server/index',
            meta: { title: 'server monitor' },
            permissions: ['monitor:server:list']
          }
        ]
      },
      {
        path: 'workflow',
        component: 'Layout',
        meta: { title: 'workflow' },
        children: [
          {
            path: 'definition',
            component: 'workflow/definition/index',
            meta: { title: 'definition' },
            permissions: ['workflow:definition:list']
          }
        ]
      }
    ];

    const filtered = filterEnterprisePortalRoutes(routes as any);
    const components = flattenComponents(filtered as any);

    expect(components).toEqual(
      expect.arrayContaining([
        'enterprise/emissionSource/index',
        'enterprise/dimension/index',
        'enterprise/licenseImport/index',
        'enterprise/activityData/index',
        'enterprise/greenPowerCertificate/index',
        'enterprise/intensityMetric/index',
        'enterprise/dataValidation/index',
        'enterprise/reportTemplateFile/index',
        'system/user/index',
        'system/user/authRole',
        'system/role/index',
        'system/role/authUser',
        'system/menu/index',
        'monitor/operlog/index',
        'monitor/logininfor/index'
      ])
    );
    expect(components).not.toEqual(
      expect.arrayContaining([
        'tool/gen/index',
        'vendor/templateScope/index',
        'system/tenant/index',
        'system/dept/index',
        'system/post/index',
        'monitor/online/index',
        'system/license/index',
        'system/factorLibrary/index',
        'system/reportTemplate/index'
      ])
    );
    expect(filtered.map((route: any) => route.path)).toEqual([
      '/system-auth',
      '/emission-source-config',
      '/factor-confirm',
      '/activity-data',
      '/green-electricity',
      '/intensity',
      '/report-management',
      '/system',
      '/log'
    ]);
    expect(filtered.every((route: any) => route.alwaysShow === true)).toBe(true);
    expect(visibleTitles([enterpriseWorkbenchRoute].concat(filtered as any))).toEqual(
      expect.arrayContaining(['工作台', '系统授权', '授权管理', '01 配置排放源', '行政区划'])
    );
    expect(visibleTitles([enterpriseWorkbenchRoute].concat(filtered as any)).slice(0, 6)).toEqual([
      '工作台',
      '系统授权',
      '授权管理',
      '01 配置排放源',
      '行政区划',
      '公司表'
    ]);
    expect(visibleChildPathsByTopLevel(filtered as any)).toEqual({
      '/system-auth': ['license-import'],
      '/emission-source-config': ['admin-division', 'company', 'emission-source-category', 'emission-source', 'base-year'],
      '/factor-confirm': ['ef-factor', 'ef-electricity-factor', 'ef-electricity-version', 'ef-electricity-scope', 'greenhouse-gas'],
      '/activity-data': ['emission-activity-data'],
      '/green-electricity': ['green-electricity-data'],
      '/intensity': ['intensity-denominator', 'intensity-target', 'denominator-fact', 'intensity-tolerance'],
      '/report-management': ['content', 'data-validation', 'report-template-download'],
      '/system': ['user', 'role', 'menu'],
      '/log': ['operlog', 'logininfor']
    });
    expect(filtered.map((route: any) => route.meta?.title)).toEqual([
      '系统授权',
      '01 配置排放源',
      '02 确认排放因子',
      '03 活动数据',
      '04 绿电绿证',
      '05 强度管理',
      '报表管理',
      '系统管理',
      '日志'
    ]);
    expect(visibleTitles(filtered)).toEqual([
      '系统授权',
      '授权管理',
      '01 配置排放源',
      '行政区划',
      '公司表',
      '排放源分类',
      '排放源识别',
      '基准年维度表',
      '02 确认排放因子',
      'EF排放因子维度表',
      'EF电力因子维度表',
      'EF电力因子版本对应',
      'EF电力因子口径维度',
      '温室气体维度',
      '03 活动数据',
      '排放活动数据',
      '04 绿电绿证',
      '绿电绿证数据',
      '05 强度管理',
      '碳排放强度分母维度表',
      '强度目标表',
      '分母事实表',
      '碳排放强度容忍率参数表',
      '报表管理',
      'Content',
      '数据验证',
      '报表模板下载',
      '系统管理',
      '用户管理',
      '角色管理',
      '菜单管理',
      '日志',
      '操作日志',
      '登录日志'
    ]);
    expect(visibleTitles(filtered)).not.toEqual(expect.arrayContaining(['活动数据录入', '因子确认记录', '因子缓存记录', '部门管理', '岗位管理']));
  });

  it('uses readable Chinese forbidden-title rules for the enterprise portal boundary', () => {
    expect(isEnterpriseForbiddenMenuTitle('客户档案')).toBe(true);
    expect(isEnterpriseForbiddenMenuTitle('License管理')).toBe(false);
    expect(isEnterpriseForbiddenMenuTitle('授权管理')).toBe(false);
    expect(isEnterpriseForbiddenMenuTitle('License 续签')).toBe(true);
    expect(isEnterpriseForbiddenMenuTitle('因子库管理')).toBe(true);
    expect(isEnterpriseForbiddenMenuTitle('模板分发')).toBe(true);
    expect(isEnterpriseForbiddenMenuTitle('续费订单')).toBe(true);
    expect(isEnterpriseForbiddenMenuTitle('部门管理')).toBe(true);
    expect(isEnterpriseForbiddenMenuTitle('岗位管理')).toBe(true);
    expect(isEnterpriseForbiddenMenuTitle('配置排放源')).toBe(false);
    expect(isEnterpriseForbiddenMenuTitle('企业本地业务')).toBe(true);
  });

  it('keeps RuoYi system permissions available to the enterprise portal', () => {
    expect(enterpriseAllowedPermissionPrefixes).toEqual(['enterprise:', 'system:', 'monitor:']);
  });
});

function flattenComponents(routes: Array<{ component?: unknown; children?: any[] }>): string[] {
  return routes.flatMap((route) => [String(route.component ?? ''), ...flattenComponents(route.children ?? [])]).filter(Boolean);
}

function visibleTitles(routes: Array<{ hidden?: boolean; meta?: { title?: unknown }; children?: any[] }>): string[] {
  return routes.flatMap((route) => {
    const own = route.hidden ? [] : [String(route.meta?.title ?? '')].filter(Boolean);
    return own.concat(visibleTitles(route.children ?? []));
  });
}

function visibleChildPathsByTopLevel(routes: Array<{ path?: unknown; hidden?: boolean; children?: any[] }>): Record<string, string[]> {
  return Object.fromEntries(
    routes.map((route) => [
      String(route.path ?? ''),
      (route.children ?? []).filter((child) => !child.hidden).map((child) => String(child.path ?? ''))
    ])
  );
}
