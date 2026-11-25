// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    // Sessions live in the browser (memory + localStorage); no server rendering of auth-dependent UI.
    ssr: false,
    devtools: { enabled: true },

    modules: [
        '@nuxtjs/tailwindcss',
        '@pinia/nuxt'
    ],

    css: ['~/assets/css/main.css'],

    // Feature modules (see .agents/rules/architecture.md): components auto-registered without
    // path prefix, composables and stores auto-imported.
    components: [
        { path: '~/components/Common', pathPrefix: false },
        { path: '~/components', pathPrefix: true },
        { path: '~/features', pattern: '*/components/**/*.vue', pathPrefix: false }
    ],

    imports: {
        dirs: ['features/*/composables', 'features/*/stores']
    },

    runtimeConfig: {
        public: {
            apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '',
            apiVersion: process.env.NUXT_PUBLIC_API_VERSION || 'v1'
        }
    },

    // Same-origin in dev: the browser calls /api/v1/<service>/... and Nitro forwards to each service.
    // Nitro registers devProxy routes in reverse-sorted order, so /api/v1/mt5-bridge wins over the /api/v1/mt5 prefix.
    nitro: {
        devProxy: {
            '/api/v1/auth': { target: `${process.env.NUXT_AUTH_URL || 'http://localhost:8001'}/api/v1/auth`, changeOrigin: true },
            '/api/v1/journal': { target: `${process.env.NUXT_JOURNAL_URL || 'http://localhost:8002'}/api/v1/journal`, changeOrigin: true },
            '/api/v1/analytics': { target: `${process.env.NUXT_ANALYTICS_URL || 'http://localhost:8003'}/api/v1/analytics`, changeOrigin: true },
            '/api/v1/mt5': { target: `${process.env.NUXT_MT5_URL || 'http://localhost:8004'}/api/v1/mt5`, changeOrigin: true },
            '/api/v1/mt5-bridge': { target: `${process.env.NUXT_BRIDGE_URL || 'http://localhost:8005'}/api/v1/mt5-bridge`, changeOrigin: true }
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
