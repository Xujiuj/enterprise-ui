import { defineStore } from 'pinia';
import defaultSettings from '@/settings';
import { useDynamicTitle } from '@/utils/dynamicTitle';
import { useStorage } from '@/utils/vueuse-lite';
import { ref } from 'vue';
import { NavTypeEnum } from '@/enums/NavTypeEnum';

const LEGACY_DEFAULT_THEME = '#409EFF';

export const useSettingsStore = defineStore('setting', () => {
  const storageSetting = useStorage<LayoutSetting>('layout-setting', {
    topNav: defaultSettings.topNav,
    tagsView: defaultSettings.tagsView,
    tagsIcon: defaultSettings.tagsIcon,
    fixedHeader: defaultSettings.fixedHeader,
    sidebarLogo: defaultSettings.sidebarLogo,
    dynamicTitle: defaultSettings.dynamicTitle,
    sideTheme: defaultSettings.sideTheme,
    theme: defaultSettings.theme,
    navType: defaultSettings.navType,
    radiusBase: defaultSettings.radiusBase
  });
  if (storageSetting.value.theme === LEGACY_DEFAULT_THEME) {
    storageSetting.value.theme = defaultSettings.theme;
  }

  const title = ref<string>(defaultSettings.title);
  const theme = ref<string>(storageSetting.value.theme);
  const sideTheme = ref<string>(storageSetting.value.sideTheme);
  const showSettings = ref<boolean>(defaultSettings.showSettings);
  const tagsView = ref<boolean>(storageSetting.value.tagsView);
  const tagsIcon = ref<boolean>(storageSetting.value.tagsIcon);
  const fixedHeader = ref<boolean>(storageSetting.value.fixedHeader);
  const sidebarLogo = ref<boolean>(storageSetting.value.sidebarLogo);
  const dynamicTitle = ref<boolean>(storageSetting.value.dynamicTitle);
  const animationEnable = ref<boolean>(defaultSettings.animationEnable);
  const dark = ref<boolean>(defaultSettings.dark);
  const navType = ref<NavTypeEnum>(storageSetting.value.navType || NavTypeEnum.LEFT);
  const radiusBase = ref<number>(storageSetting.value.radiusBase ?? defaultSettings.radiusBase);

  const setTitle = (value: string) => {
    title.value = value;
    useDynamicTitle();
  };
  return {
    title,
    theme,
    sideTheme,
    showSettings,
    tagsView,
    tagsIcon,
    fixedHeader,
    sidebarLogo,
    dynamicTitle,
    animationEnable,
    dark,
    navType,
    radiusBase,
    setTitle
  };
});
