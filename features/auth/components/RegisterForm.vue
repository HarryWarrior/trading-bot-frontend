<template>
  <AuthShell :title="t('auth.register.title')" :subtitle="t('auth.register.subtitle')">
    <form class="space-y-4" novalidate @submit.prevent="submit">
      <AppInput v-model="name" :label="t('auth.name')" autocomplete="name" required :error="fieldErrors.name" />
      <AppInput v-model="email" type="email" :label="t('auth.email')" autocomplete="email" required :error="fieldErrors.email" />
      <AppInput
        v-model="password"
        type="password"
        :label="t('auth.password')"
        autocomplete="new-password"
        required
        :hint="t('auth.password_hint')"
        :error="fieldErrors.password"
      />
      <p v-if="errorCode" class="text-xs text-red-500 font-medium" role="alert">{{ t(authErrorKey(errorCode)) }}</p>
      <AppButton type="submit" block :loading="loading">{{ t('auth.sign_up') }}</AppButton>
    </form>
    <template #footer>
      {{ t('auth.register.have_account') }}
      <NuxtLink to="/login" class="font-medium text-zinc-900 dark:text-zinc-100 underline">{{ t('auth.sign_in') }}</NuxtLink>
    </template>
  </AuthShell>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { ApiError } from '~/composables/useApiClient'
import { authApi } from '../api/authApi'
import { authErrorKey } from '../composables/authErrors'
import { isEmailLike, isPasswordLengthValid } from '../composables/validation'

const { t } = useI18n()
const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorCode = ref<string | null>(null)
const fieldErrors = reactive({ name: '', email: '', password: '' })

const submit = async () => {
  errorCode.value = null
  fieldErrors.name = name.value.trim() ? '' : t('auth.validation.name')
  fieldErrors.email = isEmailLike(email.value) ? '' : t('auth.validation.email')
  fieldErrors.password = isPasswordLengthValid(password.value) ? '' : t('auth.validation.password')
  if (fieldErrors.name || fieldErrors.email || fieldErrors.password) return
  loading.value = true
  try {
    await authApi.signUp({ name: name.value.trim(), email: email.value.trim(), password: password.value })
    await navigateTo(`/verify-email?email=${encodeURIComponent(email.value.trim())}`)
  } catch (err) {
    errorCode.value = err instanceof ApiError ? err.code : 'UNKNOWN'
  } finally {
    loading.value = false
  }
}
</script>
