<template>
  <section class="space-y-3">
    <div v-if="loading" class="space-y-2">
      <AppSkeleton v-for="row in 3" :key="row" height="h-10" />
    </div>

    <p v-else-if="error" class="text-red-500">{{ error }}</p>

    <AppEmptyState v-else-if="items.length === 0" title="No items yet" description="Create the first item to see it here." />

    <template v-else>
      <ul class="divide-y divide-gray-700">
        <li v-for="item in items" :key="item.id" class="py-2">{{ item.name }}</li>
      </ul>
      <AppPagination
        v-if="pagination"
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total-items="pagination.totalItems"
        @change="({ page, pageSize }) => load(page, pageSize)"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppEmptyState from '~/components/Common/AppEmptyState.vue'
import AppPagination from '~/components/Common/AppPagination.vue'
import AppSkeleton from '~/components/Common/AppSkeleton.vue'
import { useTemplateItems } from '../composables/useTemplateItems'

const { items, pagination, loading, error, load } = useTemplateItems()

onMounted(() => load())
</script>
