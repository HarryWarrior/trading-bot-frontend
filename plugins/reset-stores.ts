import { resetUserStatePlugin } from '~/composables/resetUserState'

export default defineNuxtPlugin(({ $pinia }) => {
  ;($pinia as { use: (p: typeof resetUserStatePlugin) => void }).use(resetUserStatePlugin)
})
