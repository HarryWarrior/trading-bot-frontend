// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: { enabled: true },

    modules: [
        '@nuxtjs/tailwindcss',
        '@pinia/nuxt'
    ],

    css: ['~/assets/css/main.css'],

    // Feature modules (see .agents/rules/architecture.md): components auto-registered without
    // path prefix, composables and stores auto-imported.
    components: [
        { path: '~/components', pathPrefix: true },
        { path: '~/features', pattern: '*/components/**/*.vue', pathPrefix: false }
    ],

    imports: {
        dirs: ['features/*/composables', 'features/*/stores']
    },

    runtimeConfig: {
        public: {
            apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
            apiVersion: process.env.NUXT_PUBLIC_API_VERSION || 'v1'
        }
    },

    app: {
        head: {
            title: 'Trading Bot Analytics',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'description', content: 'Professional Trading Analytics Dashboard' }
            ]
        }
    }
})
