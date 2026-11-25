<template>
  <div class="min-h-screen flex flex-col">
    <template v-if="isAuthenticated">
      <AppHeader
        :user-name="user?.name"
        :user-email="user?.email"
        :user-role="roleLabel"
        :user-initials="initials"
        @sign-out="handleSignOut"
      />
      <div class="flex flex-1">
        <AppSidebar />
        <main class="flex-1 min-w-0">
          <slot />
        </main>
      </div>
    </template>
    <div v-else class="flex-1 flex items-center justify-center text-sm text-zinc-500">
      {{ t('auth.session.loading') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '~/features/auth/composables/useAuth'
import { useI18n } from '~/composables/useI18n'

const { user, isAuthenticated, signOut } = useAuth()
const { t } = useI18n()

const roleLabel = computed(() => (user.value?.role === 'admin' ? t('auth.role.admin') : t('auth.role.user')))
const initials = computed(() =>
  (user.value?.name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || '?',
)

const handleSignOut = async () => {
  await signOut()
  await navigateTo('/login')
}
</script>
