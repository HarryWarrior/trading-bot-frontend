<template>
  <AuthShell :title="t('auth.verify.title')" :subtitle="t('auth.verify.subtitle')">
    <p class="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3">
      {{ t('auth.verify.hint') }}
    </p>
    <form class="space-y-4" novalidate @submit.prevent="submit">
      <AppInput v-model="email" type="email" :label="t('auth.email')" autocomplete="email" required :error="fieldErrors.email" />
      <AppInput v-model="code" :label="t('auth.verify.code')" autocomplete="one-time-code" required :error="fieldErrors.code" />
      <p v-if="errorCode" class="text-xs text-red-500 font-medium" role="alert">{{ t(authErrorKey(errorCode)) }}</p>
      <p v-if="resent" class="text-xs text-emerald-600 dark:text-emerald-400 font-medium" role="status">{{ t('auth.verify.resent') }}</p>
      <AppButton type="submit" block :loading="loading">{{ t('auth.verify.submit') }}</AppButton>
      <AppButton variant="subtle" block :disabled="loading" @click="resend">{{ t('auth.verify.resend') }}</AppButton>
    </form>
    <template #footer>
      <NuxtLink to="/login" class="font-medium text-zinc-900 dark:text-zinc-100 underline">{{ t('auth.back_to_login') }}</NuxtLink>
    </template>
  </AuthShell>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute } from '#app'
import { useI18n } from '~/composables/useI18n'
import { ApiError } from '~/composables/useApiClient'
import { authApi } from '../api/authApi'
import { authErrorKey } from '../composables/authErrors'
import { isEmailLike } from '../composables/validation'

const { t } = useI18n()
const route = useRoute()
const email = ref(typeof route.query.email === 'string' ? route.query.email : '')
const code = ref('')
const loading = ref(false)
const resent = ref(false)
const errorCode = ref<string | null>(null)
const fieldErrors = reactive({ email: '', code: '' })

const codeOf = (err: unknown) => (err instanceof ApiError ? err.code : 'UNKNOWN')

const submit = async () => {
  errorCode.value = null
  resent.value = false
  fieldErrors.email = isEmailLike(email.value) ? '' : t('auth.validation.email')
  fieldErrors.code = code.value.trim() ? '' : t('auth.validation.code')
  if (fieldErrors.email || fieldErrors.code) return
  loading.value = true
  try {
    await authApi.verifyEmail(email.value.trim(), code.value.trim())
    await navigateTo(`/login?verified=1&email=${encodeURIComponent(email.value.trim())}`)
  } catch (err) {
    errorCode.value = codeOf(err)
  } finally {
    loading.value = false
  }
}

const resend = async () => {
  errorCode.value = null
  resent.value = false
  fieldErrors.email = isEmailLike(email.value) ? '' : t('auth.validation.email')
  if (fieldErrors.email) return
  loading.value = true
  try {
    await authApi.resendVerification(email.value.trim())
    resent.value = true
  } catch (err) {
    errorCode.value = codeOf(err)
  } finally {
    loading.value = false
  }
}
</script>
