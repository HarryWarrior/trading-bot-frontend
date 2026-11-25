<template>
  <AuthShell :title="t('auth.forgot.title')" :subtitle="t('auth.forgot.subtitle')">
    <p v-if="sent" class="text-sm text-emerald-600 dark:text-emerald-400" role="status">{{ t('auth.forgot.sent') }}</p>
    <form v-else class="space-y-4" novalidate @submit.prevent="submit">
      <AppInput v-model="email" type="email" :label="t('auth.email')" autocomplete="email" required :error="emailError" />
      <p v-if="errorCode" class="text-xs text-red-500 font-medium" role="alert">{{ t(authErrorKey(errorCode)) }}</p>
      <AppButton type="submit" block :loading="loading">{{ t('auth.forgot.submit') }}</AppButton>
    </form>
    <template #footer>
      <NuxtLink to="/login" class="font-medium text-zinc-900 dark:text-zinc-100 underline">{{ t('auth.back_to_login') }}</NuxtLink>
    </template>
  </AuthShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { ApiError } from '~/composables/useApiClient'
import { authApi } from '../api/authApi'
import { authErrorKey } from '../composables/authErrors'
import { isEmailLike } from '../composables/validation'

const { t } = useI18n()
const email = ref('')
const emailError = ref('')
const loading = ref(false)
const sent = ref(false)
const errorCode = ref<string | null>(null)

const submit = async () => {
  errorCode.value = null
  emailError.value = isEmailLike(email.value) ? '' : t('auth.validation.email')
  if (emailError.value) return
  loading.value = true
  try {
    await authApi.forgotPassword(email.value.trim())
    sent.value = true
  } catch (err) {
    errorCode.value = err instanceof ApiError ? err.code : 'UNKNOWN'
  } finally {
    loading.value = false
  }
}
</script>
