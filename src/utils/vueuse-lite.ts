import { getCurrentScope, onMounted, onScopeDispose, onUnmounted, ref, watch, type Ref } from 'vue';

const getStorage = () => (typeof window === 'undefined' ? undefined : window.localStorage);

const readStoredValue = <T>(key: string, defaultValue: T): T => {
  const storage = getStorage();
  const raw = storage?.getItem(key);
  if (raw == null) {
    return defaultValue;
  }
  if (typeof defaultValue === 'string' || defaultValue === null) {
    return raw as T;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
};

const writeStoredValue = <T>(key: string, value: T) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  if (value == null) {
    storage.removeItem(key);
    return;
  }
  storage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
};

export const useStorage = <T>(key: string, defaultValue: T): Ref<T> => {
  const value = ref(readStoredValue(key, defaultValue)) as Ref<T>;
  watch(value, (nextValue) => writeStoredValue(key, nextValue), { deep: true });
  return value;
};

const darkRefs = new Map<string, Ref<boolean>>();

export const useDark = (options: { storageKey?: string; valueDark?: string; valueLight?: string } = {}) => {
  const storageKey = options.storageKey || 'vueuse-color-scheme';
  const valueDark = options.valueDark || 'dark';
  const valueLight = options.valueLight || 'light';
  const existing = darkRefs.get(storageKey);
  if (existing) {
    return existing;
  }

  const stored = getStorage()?.getItem(storageKey);
  const isDark = ref(stored ? stored === valueDark : document.documentElement.classList.contains(valueDark));
  darkRefs.set(storageKey, isDark);

  watch(
    isDark,
    (enabled) => {
      document.documentElement.classList.toggle(valueDark, enabled);
      if (valueLight && valueLight !== valueDark) {
        document.documentElement.classList.toggle(valueLight, !enabled);
      }
      writeStoredValue(storageKey, enabled ? valueDark : valueLight);
    },
    { immediate: true }
  );

  return isDark;
};

export const useToggle = (source: Ref<boolean>) => {
  return (value?: boolean) => {
    source.value = typeof value === 'boolean' ? value : !source.value;
    return source.value;
  };
};

export const useWindowSize = () => {
  const width = ref(typeof window === 'undefined' ? 0 : window.innerWidth);
  const height = ref(typeof window === 'undefined' ? 0 : window.innerHeight);
  const update = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  };

  onMounted(() => window.addEventListener('resize', update, { passive: true }));
  onUnmounted(() => window.removeEventListener('resize', update));

  return { width, height };
};

export const useEventSource = (
  url: string,
  events: string[] = [],
  options: {
    autoReconnect?: {
      retries?: number;
      delay?: number;
      onFailed?: () => void;
    };
  } = {}
) => {
  const data = ref<string | null>(null);
  const error = ref<Event | null>(null);
  let eventSource: EventSource | null = null;
  let retries = 0;
  let closed = false;

  const close = () => {
    closed = true;
    eventSource?.close();
    eventSource = null;
  };

  const connect = () => {
    if (typeof EventSource === 'undefined' || closed) {
      return;
    }
    eventSource = new EventSource(url);
    eventSource.onmessage = (event) => {
      data.value = event.data;
    };
    for (const eventName of events) {
      eventSource.addEventListener(eventName, (event) => {
        data.value = (event as MessageEvent).data;
      });
    }
    eventSource.onerror = (event) => {
      error.value = event;
      eventSource?.close();
      const autoReconnect = options.autoReconnect;
      if (!autoReconnect) {
        return;
      }
      if (retries < (autoReconnect.retries ?? 0)) {
        retries += 1;
        window.setTimeout(connect, autoReconnect.delay ?? 0);
        return;
      }
      autoReconnect.onFailed?.();
    };
  };

  connect();
  if (getCurrentScope()) {
    onScopeDispose(close);
  }

  return { data, error, close };
};
