<template>
  <div :class="{ 'has-logo': showLogo }" :style="{ backgroundColor: bgColor }">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar :class="effectiveSideTheme" wrap-class="scrollbar-wrapper">
      <transition :enter-active-class="proxy?.animate.menuSearchAnimate.enter" mode="out-in">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :background-color="bgColor"
          :text-color="textColor"
          :unique-opened="true"
          :active-text-color="theme"
          :collapse-transition="false"
          :popper-offset="12"
          mode="vertical"
        >
          <sidebar-item v-for="(r, index) in sidebarRouters" :key="r.path + index" :item="r" :base-path="r.path" />
        </el-menu>
      </transition>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import Logo from './Logo.vue';
import SidebarItem from './SidebarItem.vue';
import variables from '@/assets/styles/variables.module.scss';
import { useAppStore } from '@/store/modules/app';
import { useSettingsStore } from '@/store/modules/settings';
import { usePermissionStore } from '@/store/modules/permission';
import { useDark } from '@/utils/vueuse-lite';
import { RouteRecordRaw } from 'vue-router';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const route = useRoute();
const appStore = useAppStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();
const sidebarRouters = computed<RouteRecordRaw[]>(() => permissionStore.getSidebarRoutes());
const showLogo = computed(() => settingsStore.sidebarLogo);
const isDark = useDark({
  storageKey: 'useDarkKey',
  valueDark: 'dark',
  valueLight: 'light'
});
const effectiveSideTheme = computed(() => (isDark.value ? 'theme-dark' : 'theme-light'));
const theme = computed(() => settingsStore.theme);
const isCollapse = computed(() => !appStore.sidebar.opened);

const activeMenu = computed(() => {
  const { meta, path } = route;
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    return meta.activeMenu;
  }
  return path;
});

const bgColor = computed(() => (isDark.value ? variables.menuBackground : variables.menuLightBackground));
const textColor = computed(() => (isDark.value ? variables.menuColor : variables.menuLightColor));
</script>
