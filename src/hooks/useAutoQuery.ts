import { isRef, onBeforeUnmount, watch } from 'vue';

type QuerySource<T = unknown> = T | { value: T } | (() => T);

const IGNORED_KEYS = new Set(['pageNum', 'pageSize', 'orderByColumn', 'isAsc', 'params']);

const readSource = (source: QuerySource) => {
  if (typeof source === 'function') {
    return source();
  }
  return isRef(source) ? source.value : source;
};

const normalize = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalize);
  }
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .filter((key) => !IGNORED_KEYS.has(key))
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = normalize((value as Record<string, unknown>)[key]);
        return result;
      }, {});
  }
  return value ?? '';
};

interface AutoQueryOptions {
  delay?: number;
  immediate?: boolean;
  enabled?: boolean;
}

export const useAutoQuery = (
  querySource: QuerySource,
  onQuery: () => void | Promise<void>,
  extraSources: QuerySource[] = [],
  options: number | AutoQueryOptions = {}
) => {
  const resolvedOptions = typeof options === 'number' ? { delay: options, enabled: true } : options;
  const delay = resolvedOptions.delay ?? 320;
  const enabled = resolvedOptions.enabled ?? false;

  if (!enabled) {
    return;
  }

  let timer: ReturnType<typeof window.setTimeout> | undefined;

  const snapshot = () => JSON.stringify([normalize(readSource(querySource)), ...extraSources.map((source) => normalize(readSource(source)))]);

  watch(
    snapshot,
    () => {
      if (timer) {
        window.clearTimeout(timer);
      }
      timer = window.setTimeout(() => {
        onQuery();
      }, delay);
    },
    { flush: 'post', immediate: resolvedOptions.immediate ?? false }
  );

  onBeforeUnmount(() => {
    if (timer) {
      window.clearTimeout(timer);
    }
  });
};
