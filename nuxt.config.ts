// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: {enabled: true},
    modules: ['@nuxt/eslint', '@nuxt/ui'],
    css: ['~/assets/css/main.css'],
    colorMode: {
        preference: 'dark',
        fallback: 'dark',
        classSuffix: ''
    },
    vue: {
        compilerOptions: {
            isCustomElement: (tag) => tag === 'solid-vcard-card'
        }
    },
    app: {
        head: {
            title: 'Star Gazer',
            htmlAttrs:{
                lang: 'en'
            },
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            ],
            link: [
                {
                    rel: 'webmention',
                    href: '/api/webmentions'
                },
                {
                    rel: 'me',
                    href: 'https://github.com/KilianLeroy'
                }
            ]
        }
    }
})