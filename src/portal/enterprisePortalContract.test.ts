import { describe, expect, it } from 'vitest';
import { enterpriseAllowedPermissionPrefixes, filterEnterprisePortalRoutes, isEnterpriseForbiddenMenuTitle } from './enterprisePortalContract';

describe('enterprise dynamic router guard', () => {
  it('keeps backend returned enterprise menus and removes vendor menus', () => {
    const routes = [
      {
        path: 'enterprise',
        component: 'Layout',
        meta: { title: '企业本地业务', icon: 'company' },
        children: [
          {
            path: 'emission-source',
            component: 'system/emissionSource/index',
            meta: { title: '01 配置排放源' },
            permissions: ['enterprise:emissionSource:list']
          },
          {
            path: 'factor-query',
            component: 'system/factorLibrary/index',
            meta: { title: '因子查询' },
            permissions: ['enterprise:factor:query']
          },
          {
            path: 'report-template-download',
            component: 'system/reportTemplate/index',
            meta: { title: '报表模板下载' },
            permissions: ['enterprise:reportTemplate:download']
          },
          {
            path: 'license-issue',
            component: 'system/license/index',
            meta: { title: 'License 签发' },
            permissions: ['vendor:licenseIssue:list']
          },
          {
            path: 'template-scope',
            component: 'vendor/templateScope/index',
            meta: { title: '模板分发' },
            permissions: ['vendor:templateScope:list']
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
        meta: { title: '厂商运营' },
        children: [
          {
            path: 'customer',
            component: 'system/tenant/index',
            meta: { title: '客户档案' },
            permissions: ['vendor:customer:list']
          }
        ]
      }
    ];

    const filtered = filterEnterprisePortalRoutes(routes as any);
    const enterpriseChildren = filtered.find((route) => route.path === 'enterprise')?.children ?? [];
    const systemChildren = filtered.find((route) => route.path === 'system')?.children ?? [];

    expect(enterpriseChildren.map((route: any) => route.meta.title)).toEqual(['01 配置排放源', '因子查询', '报表模板下载']);
    expect(systemChildren.map((route: any) => route.meta.title)).toEqual(['用户管理']);
    expect(filtered.map((route: any) => route.path)).toEqual(['enterprise', 'system']);
  });

  it('uses readable Chinese forbidden-title rules for the enterprise portal boundary', () => {
    expect(isEnterpriseForbiddenMenuTitle('客户档案')).toBe(true);
    expect(isEnterpriseForbiddenMenuTitle('License管理')).toBe(true);
    expect(isEnterpriseForbiddenMenuTitle('License 续签')).toBe(true);
    expect(isEnterpriseForbiddenMenuTitle('因子库管理')).toBe(true);
    expect(isEnterpriseForbiddenMenuTitle('模板分发')).toBe(true);
    expect(isEnterpriseForbiddenMenuTitle('续费订单')).toBe(true);
    expect(isEnterpriseForbiddenMenuTitle('01 配置排放源')).toBe(false);
  });

  it('keeps RuoYi system permissions available to the enterprise portal', () => {
    expect(enterpriseAllowedPermissionPrefixes).toEqual(['enterprise:', 'system:', 'monitor:', 'tool:gen']);
  });
});
