<template>
  <div :class="classObj" class="app-wrapper" :style="{ '--current-color': theme, '--sidebar-width': sidebarWidthCss }">
    <div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <side-bar v-if="!sidebar.hide" class="sidebar-container" />
    <button v-if="showSidebarResizeHandle" type="button" class="sidebar-resize-handle" aria-label="调整菜单栏宽度" @mousedown="startSidebarResize" />
    <div :class="{ hasTagsView: needTagsView, sidebarHide: sidebar.hide }" class="main-container">
      <!-- <el-scrollbar>
        <div :class="{ 'fixed-header': fixedHeader }">
          <navbar ref="navbarRef" @setLayout="setLayout" />
          <tags-view v-if="needTagsView" />
        </div>
        <app-main />
        <settings ref="settingRef" />
      </el-scrollbar> -->
      <div :class="{ 'fixed-header': fixedHeader }">
        <navbar @set-layout="setLayout" />
        <tags-view v-if="needTagsView" />
      </div>
      <app-main />
      <settings ref="settingRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SideBar from './components/Sidebar/index.vue';
import { AppMain, Navbar, Settings, TagsView } from './components';
import { useAppStore } from '@/store/modules/app';
import { useSettingsStore } from '@/store/modules/settings';
import { NavTypeEnum } from '@/enums/NavTypeEnum';
import { initWebSocket } from '@/utils/websocket';
import { initSSE } from '@/utils/sse';
import { useWindowSize } from '@/utils/vueuse-lite';

const settingsStore = useSettingsStore();
const theme = computed(() => settingsStore.theme);
const sidebar = computed(() => useAppStore().sidebar);
const device = computed(() => useAppStore().device);
const needTagsView = computed(() => settingsStore.tagsView);
const fixedHeader = computed(() => settingsStore.fixedHeader);
const layout = computed(() => settingsStore.navType);

// 根据布局模式判断是否显示侧边栏
const showSidebar = computed(() => {
  if (sidebar.value.hide) return false;
  return layout.value === NavTypeEnum.LEFT || layout.value === NavTypeEnum.MIX;
});

const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile'
}));

const { width } = useWindowSize();
const WIDTH = 992; // refer to Bootstrap's responsive design
const SIDEBAR_WIDTH_KEY = 'enterpriseSidebarWidth';
const SIDEBAR_MIN_WIDTH = 180;
const SIDEBAR_MAX_WIDTH = 320;
const sidebarWidth = ref(Number(localStorage.getItem(SIDEBAR_WIDTH_KEY)) || 200);
const sidebarWidthCss = computed(() => `${sidebarWidth.value}px`);
const resizingSidebar = ref(false);
const showSidebarResizeHandle = computed(() => showSidebar.value && sidebar.value.opened && device.value === 'desktop');

const clampSidebarWidth = (widthValue: number) => Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, Math.round(widthValue)));

const stopSidebarResize = () => {
  if (!resizingSidebar.value) return;
  resizingSidebar.value = false;
  document.body.classList.remove('is-resizing-sidebar');
  window.removeEventListener('mousemove', resizeSidebar);
  window.removeEventListener('mouseup', stopSidebarResize);
};

const resizeSidebar = (event: MouseEvent) => {
  if (!resizingSidebar.value) return;
  sidebarWidth.value = clampSidebarWidth(event.clientX);
  localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth.value));
};

const startSidebarResize = (event: MouseEvent) => {
  event.preventDefault();
  resizingSidebar.value = true;
  document.body.classList.add('is-resizing-sidebar');
  window.addEventListener('mousemove', resizeSidebar);
  window.addEventListener('mouseup', stopSidebarResize);
};

watchEffect(() => {
  if (device.value === 'mobile') {
    useAppStore().closeSideBar({ withoutAnimation: false });
  }
  if (width.value - 1 < WIDTH) {
    useAppStore().toggleDevice('mobile');
    useAppStore().closeSideBar({ withoutAnimation: true });
  } else {
    useAppStore().toggleDevice('desktop');
  }
});

const settingRef = ref<InstanceType<typeof Settings>>();

onMounted(() => {
  const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  initWebSocket(protocol + window.location.host + import.meta.env.VITE_APP_BASE_API + '/resource/websocket');
});

onMounted(() => {
  initSSE(import.meta.env.VITE_APP_BASE_API + '/resource/sse');
});

onBeforeUnmount(() => {
  stopSidebarResize();
});

const handleClickOutside = () => {
  useAppStore().closeSideBar({ withoutAnimation: false });
};

const setLayout = () => {
  settingRef.value?.openSetting();
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixin.scss';
@use '@/assets/styles/variables.module.scss' as *;

.app-wrapper {
  @include mixin.clearfix;
  position: relative;
  height: 100%;
  width: 100%;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - var(--sidebar-width, #{$base-sidebar-width}));
  transition: width 0.28s;
  background: $fixed-header-bg;
  box-shadow: 0 2px 8px rgba(0, 21, 41, 0.1);
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.sidebarHide .fixed-header {
  width: 100%;
}

.mobile .fixed-header {
  width: 100%;
}

.sidebar-resize-handle {
  position: fixed;
  top: 0;
  bottom: 0;
  left: calc(var(--sidebar-width, #{$base-sidebar-width}) - 3px);
  z-index: 1002;
  width: 6px;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: col-resize;
}

.sidebar-resize-handle:hover,
.sidebar-resize-handle:focus-visible {
  background: rgba(22, 118, 86, 0.18);
  outline: none;
}

:global(body.is-resizing-sidebar) {
  cursor: col-resize;
  user-select: none;
}
</style>
