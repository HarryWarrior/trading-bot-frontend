<template>
  <div class="space-y-6">
    <div
      class="flex flex-col items-center justify-center p-10 text-center rounded-2xl border-2 border-dashed transition-colors cursor-pointer select-none"
      :class="dragging
        ? 'border-zinc-950 dark:border-zinc-200 bg-zinc-100/70 dark:bg-zinc-800/50'
        : 'border-zinc-300 dark:border-zinc-700/80 hover:border-zinc-400 bg-zinc-50/40 dark:bg-zinc-900/30'"
      role="button"
      tabindex="0"
      @drop.prevent="onDrop"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @click="input?.click()"
      @keydown.enter="input?.click()"
    >
      <input ref="input" type="file" accept=".csv,.xlsx,.xls" class="hidden" @change="onSelect" />
      <h3 class="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{{ t('journal.upload.drop_title') }}</h3>
      <p class="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">{{ t('journal.upload.drop_hint') }}</p>
    </div>

    <div v-if="selected" class="dub-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="min-w-0">
        <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{{ selected.name }}</p>
        <p class="text-xs text-zinc-400 font-mono">{{ formatFileSize(selected.size) }}</p>
      </div>
      <div class="flex gap-2">
        <AppButton variant="secondary" size="sm" :disabled="loading" @click="clear">{{ t('journal.upload.remove') }}</AppButton>
        <AppButton size="sm" :loading="loading" @click="submit">{{ t('journal.upload.submit') }}</AppButton>
      </div>
    </div>

    <div v-if="error" class="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-xs text-red-700 dark:text-red-300" role="alert">
      <p>{{ t(uploadErrorKey(error)) }}</p>
      <p v-if="error === 'UNREADABLE_REPORT' && errorReason" class="mt-1 font-mono">{{ errorReason }}</p>
      <NuxtLink v-if="error === 'DUPLICATE_IMPORT'" to="/trades" class="underline font-medium">
        {{ t('journal.upload.view_trades') }}
      </NuxtLink>
    </div>

    <div v-if="result" class="dub-card p-5 space-y-4" role="status">
      <div>
        <h3 class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{{ t('journal.upload.done') }}</h3>
        <p class="text-xs text-zinc-500 truncate">{{ result.filename }}</p>
      </div>
      <dl class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div v-for="stat in stats" :key="stat.label" class="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-3">
          <dd class="text-xl font-bold text-zinc-900 dark:text-zinc-100">{{ stat.value }}</dd>
          <dt class="text-[11px] text-zinc-500">{{ stat.label }}</dt>
        </div>
      </dl>
      <div v-if="result.skippedRows.length" class="space-y-2">
        <h4 class="text-xs font-semibold text-amber-600 dark:text-amber-400">
          {{ t('journal.upload.skipped_title') }} ({{ result.skippedRows.length }})
        </h4>
        <div class="max-h-64 overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table class="w-full text-xs">
            <thead class="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 text-left">
              <tr>
                <th class="px-3 py-2 w-20">{{ t('journal.upload.row') }}</th>
                <th class="px-3 py-2">{{ t('journal.upload.reason') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in result.skippedRows" :key="s.row" class="border-t border-zinc-200 dark:border-zinc-800">
                <td class="px-3 py-1.5 font-mono">{{ s.row }}</td>
                <td class="px-3 py-1.5">{{ s.reason }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <NuxtLink to="/trades" class="inline-block text-xs underline font-medium text-zinc-900 dark:text-zinc-100">
        {{ t('journal.upload.view_trades') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '~/composables/useI18n'
import AppButton from '~/components/Common/AppButton.vue'
import { useJournalImport } from '../composables/useJournal'
import { formatFileSize, uploadErrorKey, validateUploadFile } from '../composables/uploadErrors'

const { t } = useI18n()
const { result, loading, error, errorReason, upload, reset } = useJournalImport()

const input = ref<HTMLInputElement | null>(null)
const selected = ref<File | null>(null)
const dragging = ref(false)

const stats = computed(() => [
  { label: t('journal.upload.created'), value: result.value?.tradesCreated ?? 0 },
  { label: t('journal.upload.updated'), value: result.value?.tradesUpdated ?? 0 },
  { label: t('journal.upload.balance_events'), value: result.value?.balanceEvents ?? 0 },
  { label: t('journal.upload.skipped'), value: result.value?.skippedRows.length ?? 0 },
])

const pick = (file: File | undefined) => {
  if (!file) return
  reset()
  const check = validateUploadFile(file)
  if (!check.ok) {
    selected.value = null
    // Surface the same code the backend would return.
    error.value = check.code
    return
  }
  selected.value = file
}

const onDrop = (e: DragEvent) => {
  dragging.value = false
  pick(e.dataTransfer?.files?.[0])
}
const onSelect = (e: Event) => {
  const el = e.target as HTMLInputElement
  pick(el.files?.[0])
  el.value = ''
}
const clear = () => {
  selected.value = null
  reset()
}
const submit = async () => {
  if (!selected.value) return
  if (await upload(selected.value)) selected.value = null
}
</script>
