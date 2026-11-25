<template>
  <div class="space-y-6">
    <Mt5BridgeTokenPanel />
    <Mt5BridgeEaDownload />
    <Mt5BridgeAccountList />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useMt5Bridge } from '../composables/useMt5Bridge'
import Mt5BridgeAccountList from './Mt5BridgeAccountList.vue'
import Mt5BridgeEaDownload from './Mt5BridgeEaDownload.vue'
import Mt5BridgeTokenPanel from './Mt5BridgeTokenPanel.vue'

// Available to every signed-in user: the EA bridge is per user (its own tokens and accounts).
const { loadTokens, loadAccounts } = useMt5Bridge()
onMounted(() => {
  void loadTokens()
  void loadAccounts()
})
</script>
