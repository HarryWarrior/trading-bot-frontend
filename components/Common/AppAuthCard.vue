<template>
  <div class="w-full max-w-md mx-auto space-y-6">
    <!-- Brand Header -->
    <div class="text-center space-y-2">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-subtle mb-2 font-bold text-lg">
        ✦
      </div>
      <h1 class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {{ isLogin ? 'Welcome back' : 'Create your account' }}
      </h1>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">
        {{ isLogin
          ? 'Enter your credentials to access your trading workstation'
          : 'Start monitoring your algorithmic portfolios with precision'
        }}
      </p>
    </div>

    <!-- Main Auth Card -->
    <div class="dub-card p-6 sm:p-8 space-y-6">
      <!-- Mode Tabs -->
      <div class="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50">
        <button
          type="button"
          :class="[
            'py-1.5 text-xs font-medium rounded-md transition-all duration-150',
            isLogin
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-subtle'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          ]"
          @click="mode = 'login'"
        >
          Log In
        </button>
        <button
          type="button"
          :class="[
            'py-1.5 text-xs font-medium rounded-md transition-all duration-150',
            !isLogin
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-subtle'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          ]"
          @click="mode = 'register'"
        >
          Sign Up
        </button>
      </div>

      <!-- Social Logins -->
      <div class="grid grid-cols-2 gap-3">
        <AppButton
          variant="secondary"
          size="sm"
          block
          @click="$emit('oauth', 'google')"
        >
          <template #startIcon>
            <svg class="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </template>
          Google
        </AppButton>
        <AppButton
          variant="secondary"
          size="sm"
          block
          @click="$emit('oauth', 'github')"
        >
          <template #startIcon>
            <span>🐙</span>
          </template>
          GitHub
        </AppButton>
      </div>

      <!-- Divider -->
      <div class="relative flex items-center justify-center">
        <div class="w-full border-t border-zinc-200 dark:border-zinc-800" />
        <span class="absolute bg-white dark:bg-zinc-900 px-3 text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
          Or continue with email
        </span>
      </div>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <AppInput
          v-if="!isLogin"
          v-model="name"
          label="Full Name"
          placeholder="Harry Trader"
          required
        />

        <AppInput
          v-model="email"
          type="email"
          label="Email Address"
          placeholder="trader@fund.com"
          required
        />

        <AppInput
          v-model="password"
          type="password"
          label="Password"
          placeholder="••••••••••••"
          required
        >
          <template #labelAction>
            <a
              v-if="isLogin"
              href="#forgot"
              class="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Forgot password?
            </a>
          </template>
        </AppInput>

        <!-- Password Checklist for Sign Up -->
        <div
          v-if="!isLogin"
          class="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200/60 dark:border-zinc-700/50 space-y-1.5"
        >
          <p class="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Password strength:</p>
          <div class="grid grid-cols-2 gap-1 text-[11px]">
            <span
              :class="[
                'flex items-center gap-1.5',
                hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
              ]"
            >
              <span>{{ hasMinLength ? '✓' : '○' }}</span> 8+ characters
            </span>
            <span
              :class="[
                'flex items-center gap-1.5',
                hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
              ]"
            >
              <span>{{ hasNumber ? '✓' : '○' }}</span> 1 number/symbol
            </span>
          </div>
        </div>

        <AppButton
          type="submit"
          variant="primary"
          block
          :loading="loading"
        >
          <template #endIcon>
            <span>→</span>
          </template>
          {{ isLogin ? 'Sign In' : 'Create Account' }}
        </AppButton>
      </form>
    </div>

    <!-- Legal Terms -->
    <p class="text-center text-xs text-zinc-400 dark:text-zinc-500">
      By signing in, you agree to our
      <a href="#terms" class="underline underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-300">Terms of Service</a>
      and
      <a href="#privacy" class="underline underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-300">Privacy Policy</a>.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AppButton from './AppButton.vue'
import AppInput from './AppInput.vue'

const props = withDefaults(defineProps<{
  initialMode?: 'login' | 'register'
  loading?: boolean
}>(), {
  initialMode: 'login',
  loading: false
})

const emit = defineEmits<{
  (e: 'submit', payload: { mode: 'login' | 'register'; name?: string; email: string; password: string }): void
  (e: 'oauth', provider: 'google' | 'github'): void
}>()

const mode = ref<'login' | 'register'>(props.initialMode)
const isLogin = computed(() => mode.value === 'login')

const name = ref('')
const email = ref('')
const password = ref('')

const hasMinLength = computed(() => password.value.length >= 8)
const hasNumber = computed(() => /[0-9!@#$%^&*]/.test(password.value))

const handleSubmit = () => {
  emit('submit', {
    mode: mode.value,
    name: !isLogin.value ? name.value : undefined,
    email: email.value,
    password: password.value,
  })
}
</script>
