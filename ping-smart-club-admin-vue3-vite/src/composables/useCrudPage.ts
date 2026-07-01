import { ref, type Ref } from 'vue';

export type CrudDrawerMode = 'create' | 'edit' | 'view';

export interface CrudPageState<T> {
  keyword: Ref<string>;
  loading: Ref<boolean>;
  saving: Ref<boolean>;
  errorText: Ref<string>;
  drawerOpen: Ref<boolean>;
  drawerMode: Ref<CrudDrawerMode>;
  currentRecord: Ref<T | null>;
  load: () => Promise<void>;
  openCreate: () => void;
  openEdit: (record: T) => void;
  openView: (record: T) => void;
  closeDrawer: () => void;
  submit: (handler: () => Promise<void>) => Promise<void>;
}

export function useCrudPage<T>(loader?: () => Promise<void>): CrudPageState<T> {
  const keyword = ref('');
  const loading = ref(false);
  const saving = ref(false);
  const errorText = ref('');
  const drawerOpen = ref(false);
  const drawerMode = ref<CrudDrawerMode>('view');
  const currentRecord = ref<T | null>(null) as Ref<T | null>;

  const load = async () => {
    if (!loader) return;
    loading.value = true;
    errorText.value = '';
    try {
      await loader();
    } catch (error) {
      errorText.value = error instanceof Error ? error.message : '加载失败，请稍后重试';
    } finally {
      loading.value = false;
    }
  };

  const openCreate = () => {
    currentRecord.value = null;
    drawerMode.value = 'create';
    drawerOpen.value = true;
  };

  const openEdit = (record: T) => {
    currentRecord.value = record;
    drawerMode.value = 'edit';
    drawerOpen.value = true;
  };

  const openView = (record: T) => {
    currentRecord.value = record;
    drawerMode.value = 'view';
    drawerOpen.value = true;
  };

  const closeDrawer = () => {
    drawerOpen.value = false;
  };

  const submit = async (handler: () => Promise<void>) => {
    saving.value = true;
    try {
      await handler();
      drawerOpen.value = false;
      await load();
    } finally {
      saving.value = false;
    }
  };

  return {
    keyword,
    loading,
    saving,
    errorText,
    drawerOpen,
    drawerMode,
    currentRecord,
    load,
    openCreate,
    openEdit,
    openView,
    closeDrawer,
    submit,
  };
}
