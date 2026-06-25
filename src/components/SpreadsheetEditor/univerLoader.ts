let univerLoader:
  | Promise<{
      Univer: any;
      LocaleType: any;
      FUniver: any;
      UniverSheetsCorePreset: any;
      zhCN: any;
    }>
  | undefined;

export const loadUniverSheetsCore = () => {
  if (!univerLoader) {
    univerLoader = Promise.all([
      import('@univerjs/preset-sheets-core/lib/index.css').then(() => import('@univerjs/core')),
      import('@univerjs/core/facade'),
      import('@univerjs/preset-sheets-core'),
      import('@univerjs/preset-sheets-core/locales/zh-CN')
    ]).then(([core, facade, preset, zhCN]) => ({
      Univer: core.Univer,
      LocaleType: core.LocaleType,
      FUniver: facade.FUniver,
      UniverSheetsCorePreset: preset.UniverSheetsCorePreset,
      zhCN
    }));
  }
  return univerLoader;
};
