<template>
  <AuthShell :title="t('auth.login.title')" :subtitle="t('auth.login.subtitle')">
    <p v-if="notice" class="text-xs text-emerald-600 dark:text-emerald-400 font-medium" role="status">{{ notice }}</p>
    <form class="space-y-4" novalidate @submit.prevent="submit">
      <AppInput v-model="email" type="email" :label="t('auth.email')" autocomplete="email" required :error="fieldErrors.email" />
      <AppInput v-model="password" type="password" :label="t('auth.password')" autocomplete="current-password" required :error="fieldErrors.password">
        <template #labelAction>
          <NuxtLink to="/forgot-password" class="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200">
            {{ t('auth.login.forgot') }}
          </NuxtLink>
        </template>
      </AppInput>
      <p v-if="errorCode" class="text-xs text-red-500 font-medium" role="alert">
        {{ t(authErrorKey(errorCode)) }}
        <NuxtLink v-if="errorCode === 'EMAIL_NOT_VERIFIED'" :to="verifyLink" class="underline">
          {{ t('auth.login.verify_link') }}
        </NuxtLink>
      </p>
      <AppButton type="submit" block :loading="loading">{{ t('auth.sign_in') }}</AppButton>
    </form>
    <template #footer>
      {{ t('auth.login.no_account') }}
      <NuxtLink to="/register" class="font-medium text-zinc-900 dark:text-zinc-100 underline">{{ t('auth.sign_up') }}</NuxtLink>
    </template>
  </AuthShell>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from '#app'
import { useI18n } from '~/composables/useI18n'
import { useAuthStore } from '../stores/auth'
import { authErrorKey } from '../composables/authErrors'
import { isEmailLike } from '../composables/validation'

const { t } = useI18n()
const route = useRoute()
const auth = useAuthStore()

const email = ref(typeof route.query.email === 'string' ? route.query.email : '')
const password = ref('')
const loading = ref(false)
const errorCode = ref<string | null>(null)
const fieldErrors = reactive({ email: '', password: '' })

const notice = computed(() => {
  if (route.query.verified) return t('auth.login.verified')
  if (route.query.reset) return t('auth.login.reset_done')
  return ''
})
const verifyLink = computed(() => `/verify-email?email=${encodeURIComponent(email.value)}`)

const submit = async () => {
  errorCode.value = null
  fieldErrors.email = isEmailLike(email.value) ? '' : t('auth.validation.email')
  fieldErrors.password = password.value ? '' : t('auth.validation.password')
  if (fieldErrors.email || fieldErrors.password) return
  loading.value = true
  try {
    await auth.signIn(email.value.trim(), password.value)
    await navigateTo('/journal')
  } catch {
    errorCode.value = auth.error ?? 'UNKNOWN'
  } finally {
    loading.value = false
  }
}
</script>
