<script setup lang="ts">
import { Pencil, Plus, RefreshCw, ToggleLeft, ToggleRight } from '@lucide/vue';
import { computed, onMounted, reactive, ref } from 'vue';

import { adminApi } from '@/api/admin';
import BaseButton from '@/components/BaseButton.vue';
import BaseCard from '@/components/BaseCard.vue';
import DataTable, { type TableColumn } from '@/components/DataTable.vue';
import DataToolbar from '@/components/DataToolbar.vue';
import DetailDrawer from '@/components/DetailDrawer.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import type { CourseProduct, CourseType } from '@/types/domain';
import { currency, pickText } from '@/utils/format';

const courseTypes = ref<CourseType[]>([]);
const products = ref<CourseProduct[]>([]);
const tab = ref<'types' | 'products'>('types');
const keyword = ref('');
const loading = ref(false);
const saving = ref(false);
const typeDrawerOpen = ref(false);
const productDrawerOpen = ref(false);

const emptyType = (): Omit<CourseType, 'id'> & Partial<Pick<CourseType, 'id'>> => ({
  name: '',
  description: '',
  status: 'active',
});

const emptyProduct = (): Omit<CourseProduct, 'id'> & Partial<Pick<CourseProduct, 'id'>> => ({
  typeId: '',
  name: '',
  capacity: 8,
  price: 180,
  creditCost: 1,
  durationMinutes: 90,
  status: 'online',
});

const typeForm = reactive(emptyType());
const productForm = reactive(emptyProduct());

const typeColumns: TableColumn[] = [
  { key: 'name', label: '课程类型' },
  { key: 'description', label: '说明' },
  { key: 'status', label: '状态', width: '96px' },
];

const productColumns: TableColumn[] = [
  { key: 'name', label: '课程产品' },
  { key: 'typeName', label: '所属类型' },
  { key: 'capacity', label: '容量', align: 'right' },
  { key: 'priceText', label: '价格', align: 'right' },
  { key: 'creditCost', label: '消耗课时', align: 'right' },
  { key: 'durationText', label: '时长' },
  { key: 'status', label: '状态', width: '96px' },
];

const typeRows = computed(() => courseTypes.value.filter((item) => pickText(item, ['name', 'description'], keyword.value)));

const productRows = computed(() =>
  products.value
    .filter((item) => pickText(item, ['name'], keyword.value) || typeName(item.typeId).includes(keyword.value))
    .map((item) => ({
      ...item,
      typeName: typeName(item.typeId),
      priceText: currency(item.price),
      durationText: `${item.durationMinutes} 分钟`,
    })),
);

const typeName = (typeId: string) => courseTypes.value.find((item) => item.id === typeId)?.name || '未选择';

const load = async () => {
  loading.value = true;
  try {
    const resp = await adminApi.getCourses();
    courseTypes.value = resp.data.types;
    products.value = resp.data.products;
    if (!productForm.typeId && resp.data.types[0]) productForm.typeId = resp.data.types[0].id;
  } finally {
    loading.value = false;
  }
};

const openCreateType = () => {
  Object.assign(typeForm, emptyType());
  typeDrawerOpen.value = true;
};

const openEditType = (row: CourseType) => {
  Object.assign(typeForm, structuredClone(row));
  typeDrawerOpen.value = true;
};

const openCreateProduct = () => {
  Object.assign(productForm, emptyProduct(), { typeId: courseTypes.value[0]?.id || '' });
  productDrawerOpen.value = true;
};

const openEditProduct = (row: CourseProduct) => {
  Object.assign(productForm, structuredClone(row));
  productDrawerOpen.value = true;
};

const saveType = async () => {
  if (!typeForm.name.trim()) return;
  saving.value = true;
  try {
    await adminApi.saveCourseType(structuredClone(typeForm));
    typeDrawerOpen.value = false;
    await load();
  } finally {
    saving.value = false;
  }
};

const saveProduct = async () => {
  if (!productForm.name.trim() || !productForm.typeId) return;
  saving.value = true;
  try {
    await adminApi.saveCourseProduct(structuredClone(productForm));
    productDrawerOpen.value = false;
    await load();
  } finally {
    saving.value = false;
  }
};

const toggleType = async (row: CourseType) => {
  await adminApi.saveCourseType({ ...row, status: row.status === 'active' ? 'inactive' : 'active' });
  await load();
};

const toggleProduct = async (row: CourseProduct) => {
  await adminApi.saveCourseProduct({ ...row, status: row.status === 'online' ? 'offline' : 'online' });
  await load();
};

onMounted(load);
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1 class="page-title">课程管理</h1>
        <p class="page-description">维护课程类型、课程产品、上下架、容量、价格和课时消耗。</p>
      </div>
      <BaseButton variant="primary" @click="tab === 'types' ? openCreateType() : openCreateProduct()">
        <template #icon><Plus /></template>
        {{ tab === 'types' ? '新增课程类型' : '新增课程产品' }}
      </BaseButton>
    </header>

    <BaseCard>
      <DataToolbar v-model:keyword="keyword" placeholder="搜索课程类型或产品">
        <template #filters>
          <div class="tabs">
            <button class="tab-button" :class="{ active: tab === 'types' }" @click="tab = 'types'">课程类型</button>
            <button class="tab-button" :class="{ active: tab === 'products' }" @click="tab = 'products'">课程产品</button>
          </div>
        </template>
        <template #actions>
          <BaseButton :loading="loading" @click="load">
            <template #icon><RefreshCw /></template>
            刷新
          </BaseButton>
        </template>
      </DataToolbar>

      <DataTable v-if="tab === 'types'" :columns="typeColumns" :rows="typeRows">
        <template #cell-status="{ value }"><StatusBadge :status="String(value)" /></template>
        <template #actions="{ row }">
          <div class="row-actions">
            <BaseButton size="sm" @click="toggleType(row)">
              <template #icon>
                <ToggleRight v-if="row.status === 'active'" />
                <ToggleLeft v-else />
              </template>
              {{ row.status === 'active' ? '停用' : '启用' }}
            </BaseButton>
            <BaseButton size="sm" @click="openEditType(row)">
              <template #icon><Pencil /></template>
              编辑
            </BaseButton>
          </div>
        </template>
      </DataTable>

      <DataTable v-else :columns="productColumns" :rows="productRows">
        <template #cell-status="{ value }"><StatusBadge :status="String(value)" /></template>
        <template #actions="{ row }">
          <div class="row-actions">
            <BaseButton size="sm" @click="toggleProduct(row)">
              <template #icon>
                <ToggleRight v-if="row.status === 'online'" />
                <ToggleLeft v-else />
              </template>
              {{ row.status === 'online' ? '下架' : '上架' }}
            </BaseButton>
            <BaseButton size="sm" @click="openEditProduct(row)">
              <template #icon><Pencil /></template>
              编辑
            </BaseButton>
          </div>
        </template>
      </DataTable>
    </BaseCard>

    <DetailDrawer v-model="typeDrawerOpen" :title="typeForm.id ? '编辑课程类型' : '新增课程类型'">
      <div class="grid grid-2">
        <label class="field">
          <span>类型名称</span>
          <input v-model.trim="typeForm.name" class="input" />
        </label>
        <label class="field">
          <span>状态</span>
          <select v-model="typeForm.status" class="select">
            <option value="active">启用</option>
            <option value="inactive">停用</option>
          </select>
        </label>
      </div>
      <label class="field">
        <span>说明</span>
        <textarea v-model.trim="typeForm.description" class="textarea" />
      </label>
      <template #footer>
        <BaseButton @click="typeDrawerOpen = false">取消</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="saveType">保存</BaseButton>
      </template>
    </DetailDrawer>

    <DetailDrawer v-model="productDrawerOpen" :title="productForm.id ? '编辑课程产品' : '新增课程产品'">
      <div class="grid grid-2">
        <label class="field">
          <span>产品名称</span>
          <input v-model.trim="productForm.name" class="input" />
        </label>
        <label class="field">
          <span>课程类型</span>
          <select v-model="productForm.typeId" class="select">
            <option v-for="type in courseTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
          </select>
        </label>
        <label class="field">
          <span>容量</span>
          <input v-model.number="productForm.capacity" class="input" min="1" type="number" />
        </label>
        <label class="field">
          <span>价格</span>
          <input v-model.number="productForm.price" class="input" min="0" type="number" />
        </label>
        <label class="field">
          <span>消耗课时</span>
          <input v-model.number="productForm.creditCost" class="input" min="1" type="number" />
        </label>
        <label class="field">
          <span>时长（分钟）</span>
          <input v-model.number="productForm.durationMinutes" class="input" min="30" step="15" type="number" />
        </label>
        <label class="field">
          <span>状态</span>
          <select v-model="productForm.status" class="select">
            <option value="online">上架</option>
            <option value="offline">下架</option>
          </select>
        </label>
      </div>
      <template #footer>
        <BaseButton @click="productDrawerOpen = false">取消</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="saveProduct">保存</BaseButton>
      </template>
    </DetailDrawer>
  </div>
</template>
