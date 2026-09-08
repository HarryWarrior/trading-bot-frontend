/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
    ],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
            },
            colors: {
                border: {
                    DEFAULT: '#e4e4e7',
                    dark: '#27272a',
                    subtle: '#f4f4f5',
                    'subtle-dark': '#18181b',
                },
                background: {
                    DEFAULT: '#ffffff',
                    dark: '#09090b',
                    subtle: '#fafafa',
                    'subtle-dark': '#121215',
                },
                foreground: {
                    DEFAULT: '#09090b',
                    dark: '#fafafa',
                    muted: '#71717a',
                    'muted-dark': '#a1a1aa',
                },
                gray: {
                    750: '#2d3748',
                    850: '#171f2d',
                },
                trading: {
                    primary: '#09090b',
                    secondary: '#27272a',
                    success: '#10b981',
                    error: '#ef4444',
                    warning: '#f59e0b',
                    info: '#0284c7',
                }
            },
            boxShadow: {
                subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
                dropdown: "0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)",
                modal: "0 24px 48px -12px rgba(0, 0, 0, 0.18)",
                'button-primary': "0 1px 2px 0 rgba(0, 0, 0, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)",
            },
            borderRadius: {
                'xs': '4px',
                'sm': '6px',
                'md': '8px',
                'lg': '10px',
                'xl': '12px',
                '2xl': '16px',
            }
        },
    },
    plugins: [],
}

