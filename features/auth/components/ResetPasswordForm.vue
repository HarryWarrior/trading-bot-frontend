<template>
  <AuthShell :title="t('auth.reset.title')">
    <p v-if="!token" class="text-sm text-red-500" role="alert">{{ t('auth.reset.missing_token') }}</p>
    <form v-else class="space-y-4" novalidate @submit.prevent="submit">
      <AppInput
        v-model="password"
        type="password"
        :label="t('auth.new_password')"
        autocomplete="new-password"
        required
        :hint="t('auth.password_hint')"
        :error="passwordError"
      />
      <p v-if="errorCode" class="text-xs text-red-500 font-medium" role="alert">{{ t(authErrorKey(errorCode)) }}</p>
      <AppButton type="submit" block :loading="loading">{{ t('auth.reset.submit') }}</AppButton>
    </form>
    <template #footer>
      <NuxtLink v-if="!token || errorCode === 'INVALID_TOKEN'" to="/forgot-password" class="underline mr-3">
        {{ t('auth.forgot.submit') }}
      </NuxtLink>
      <NuxtLink to="/login" class="font-medium text-zinc-900 dark:text-zinc-100 underline">{{ t('auth.back_to_login') }}</NuxtLink>
    </template>
  </AuthShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from '#app'
import { useI18n } from '~/composables/useI18n'
import { ApiError } from '~/composables/useApiClient'
import { authApi } from '../api/authApi'
import { authErrorKey } from '../composables/authErrors'
import { isPasswordLengthValid } from '../composables/validation'

const { t } = useI18n()
const route = useRoute()
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const password = ref('')
const passwordError = ref('')
const loading = ref(false)
const errorCode = ref<string | null>(null)

const submit = async () => {
  errorCode.value = null
  passwordError.value = isPasswordLengthValid(password.value) ? '' : t('auth.validation.password')
  if (passwordError.value) return
  loading.value = true
  try {
    await authApi.resetPassword({ token: token.value, newPassword: password.value })
    await navigateTo('/login?reset=1')
  } catch (err) {
    errorCode.value = err instanceof ApiError ? err.code : 'UNKNOWN'
  } finally {
    loading.value = false
  }
}
</script>
