<template>
  <div class="max-w-4xl mx-auto p-6 sm:p-10 space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5">
      <div>
        <NuxtLink to="/journal" class="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1.5 mb-2 transition-colors">
          <span>←</span> Back to Journal
        </NuxtLink>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Upload Trade Statement
        </h1>
        <p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Ingest historical MT5 execution statements (.csv, .xlsx) for algorithmic risk auditing.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <AppThemeToggle />
        <NuxtLink to="/journal">
          <AppButton variant="secondary" size="sm">
            View Dashboard
          </AppButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Instruction Card -->
    <div class="dub-card p-5 space-y-3 bg-zinc-50/60 dark:bg-zinc-900/60">
      <div class="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <span>📋</span>
        <span>Export Instructions from MetaTrader 5</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-600 dark:text-zinc-400">
        <div class="p-3 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
          <span class="font-bold text-zinc-900 dark:text-zinc-200">1. Open MT5 History</span>
          <p class="text-[11px] text-zinc-500">Go to Toolbox → History tab and select your custom period.</p>
        </div>
        <div class="p-3 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
          <span class="font-bold text-zinc-900 dark:text-zinc-200">2. Save as Report</span>
          <p class="text-[11px] text-zinc-500">Right click → Report → Select <code>CSV</code> or <code>HTML/XML</code>.</p>
        </div>
        <div class="p-3 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
          <span class="font-bold text-zinc-900 dark:text-zinc-200">3. Drop File Below</span>
          <p class="text-[11px] text-zinc-500">Upload to generate instant portfolio risk & equity metrics.</p>
        </div>
      </div>
    </div>

    <!-- Dropzone -->
    <div
      class="relative flex flex-col items-center justify-center p-10 sm:p-14 text-center rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none"
      :class="isDragging
        ? 'border-zinc-950 dark:border-zinc-200 bg-zinc-100/70 dark:bg-zinc-800/50 scale-[1.01]'
        : 'border-zinc-300 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/40 dark:bg-zinc-900/30'"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @click="($refs.fileInput as HTMLInputElement)?.click()"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".csv,.xlsx,.xls"
        class="hidden"
        @change="handleFileSelect"
      />

      <div class="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center text-zinc-600 dark:text-zinc-300 mb-4 shadow-subtle">
        <span class="text-2xl">📤</span>
      </div>

      <h3 class="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
        Drag & drop your statement here
      </h3>
      <p class="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
        Supports .CSV, .XLSX, and .XLS exported directly from MetaTrader 4 / MetaTrader 5 (Max 10MB).
      </p>

      <AppButton
        variant="secondary"
        size="sm"
        @click.stop="($refs.fileInput as HTMLInputElement)?.click()"
      >
        Select File from Computer
      </AppButton>
    </div>

    <!-- File Preview Card -->
    <div v-if="selectedFile" class="dub-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl shrink-0">
          📄
        </div>
        <div>
          <h4 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-xs sm:max-w-md">
            {{ selectedFile.name }}
          </h4>
          <p class="text-xs text-zinc-400 font-mono">
            {{ formatFileSize(selectedFile.size) }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <AppButton
          variant="secondary"
          size="sm"
          @click="selectedFile = null"
        >
          Remove
        </AppButton>
        <AppButton
          variant="primary"
          size="sm"
          :loading="uploading"
          @click="uploadFile"
        >
          <template #startIcon>
            <span v-if="!uploading">🚀</span>
          </template>
          Process Statement
        </AppButton>
      </div>
    </div>

    <!-- Feedback Banners -->
    <div
      v-if="error"
      class="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-xs text-red-700 dark:text-red-300 flex items-center gap-2.5"
    >
      <span>⚠️</span>
      <span>{{ error }}</span>
    </div>

    <div
      v-if="success"
      class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5"
    >
      <span>✓</span>
      <span>Statement uploaded and parsed successfully! Redirecting to Journal...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAnalyticsStore } from '~/stores/analytics'
import AppButton from '~/components/Common/AppButton.vue'
import AppThemeToggle from '~/components/Common/AppThemeToggle.vue'

const router = useRouter()
const analyticsStore = useAnalyticsStore()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const uploading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    validateAndSetFile(files[0])
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    validateAndSetFile(files[0])
  }
}

const validateAndSetFile = (file: File) => {
  const validExtensions = ['.csv', '.xlsx', '.xls']
  const isValid = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  
  if (!isValid) {
    error.value = 'Invalid format. Only .CSV and .XLSX files are supported.'
    return
  }
  
  if (file.size > 10 * 1024 * 1024) {
    error.value = 'File size exceeds maximum threshold (10 MB).'
    return
  }
  
  selectedFile.value = file
  error.value = null
}

const uploadFile = async () => {
  if (!selectedFile.value) return
  
  uploading.value = true
  error.value = null
  
  try {
    await analyticsStore.uploadTrades(selectedFile.value)
    success.value = true
    
    setTimeout(() => {
      router.push('/journal')
    }, 1200)
  } catch (err: any) {
    error.value = err.message || 'Error processing trade statement'
  } finally {
    uploading.value = false
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

useHead({
  title: 'Upload Trade Statement'
})
</script>

<style scoped>
/* Component styles */
</style>
