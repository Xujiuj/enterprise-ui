import { describe, expect, it } from 'vitest';
import { enterpriseAllowedPermissionPrefixes, filterEnterprisePortalRoutes, isEnterpriseForbiddenMenuTitle } from './enterprisePortalContract';

describe('enterprise dynamic router guard', () => {
  it('keeps backend returned enterprise menus and removes vendor menus', () => {
    const routes = [
      {
        path: 'emission-source-config',
        component: 'Layout',
        meta: { title: 'emission source config' },
        children: [
          {
            path: 'emission-source',
            component: 'enterprise/emissionSource/index',
            meta: { title: 'emission source' },
            permissions: ['enterprise:emissionSource:list']
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
        path: 'data-management',
        component: 'Layout',
        meta: { title: '数据管理' },
        children: [
          {
            path: 'admin-division',
            component: 'enterprise/dimension/index',
            meta: { title: 'admin division' },
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
            path: 'factor-cache-record',
            component: 'enterprise/factorCacheRecord/index',
            meta: { title: 'factor cache record' },
            permissions: ['enterprise:factorCacheRecord:list']
          },
          {
            path: 'report-template-download',
            component: 'enterprise/reportTemplateFile/index',
            meta: { title: 'report template file' },
            permissions: ['enterprise:reportTemplateFile:list']
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
        meta: { title: 'factor confirm' },
        children: [
          {
            path: 'factor-confirmation',
            component: 'enterprise/factorConfirmation/index',
            meta: { title: 'factor confirmation' },
            permissions: ['enterprise:factorConfirmation:list']
          }
        ]
      },
      {
        path: 'activity-data',
        component: 'Layout',
        meta: { title: 'activity data' },
        children: [
          {
            path: 'emission-activity-data',
            component: 'enterprise/activityData/index',
            meta: { title: 'activity data list' },
            permissions: ['enterprise:activityData:list']
          },
          {
            path: 'emission-activity-entry',
            component: 'enterprise/activityEntry/index',
            meta: { title: 'activity data entry' },
            permissions: ['enterprise:activityImportValidation:validate']
          }
        ]
      },
      {
        path: 'green-electricity',
        component: 'Layout',
        meta: { title: 'green electricity' },
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
        meta: { title: 'intensity' },
        children: [
          {
            path: 'intensity-target',
            component: 'enterprise/intensityMetric/index',
            meta: { title: 'intensity metric' },
            permissions: ['enterprise:intensityMetric:list']
          }
        ]
      },
      {
        path: 'report-management',
        component: 'Layout',
        meta: { title: 'report management' },
        children: [
          {
            path: 'data-validation',
            component: 'enterprise/dataValidation/index',
            meta: { title: 'data validation' },
            permissions: ['enterprise:dataValidation:view']
          },
          {
            path: 'tool-gen',
            component: 'tool/gen/index',
            meta: { title: 'code generation' },
            permissions: ['tool:gen:list']
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
        'enterprise/factorConfirmation/index',
        'enterprise/factorCacheRecord/index',
        'enterprise/activityData/index',
        'enterprise/activityEntry/index',
        'enterprise/greenPowerCertificate/index',
        'enterprise/intensityMetric/index',
        'enterprise/dataValidation/index',
        'enterprise/reportTemplateFile/index',
        'system/user/index',
        'system/role/index',
        'system/menu/index',
        'monitor/operlog/index',
        'monitor/logininfor/index'
      ])
    );
    expect(components).not.toEqual(
      expect.arrayContaining(['tool/gen/index', 'vendor/templateScope/index', 'system/tenant/index', 'system/dept/index', 'monitor/online/index'])
    );
    const dataManagement = filtered.find((route: any) => route.path === '/data-management') as any;
    expect(dataManagement.children.map((route: any) => route.path)).toEqual(
      expect.arrayContaining(['admin-division', 'ef-electricity-version', 'ef-electricity-scope', 'factor-cache-record', 'report-template-download'])
    );
    expect(filtered.map((route: any) => route.path)).toEqual([
      '/emission-source-config',
      '/data-management',
      '/system-auth',
      '/factor-confirm',
      '/activity-data',
      '/green-electricity',
      '/intensity',
      '/report-management',
      '/system',
      '/log'
    ]);
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
