// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: {enabled: true},
    modules: ['@nuxt/eslint', '@nuxt/ui'],
    css: ['~/assets/css/main.css'],
    vue: {
        compilerOptions: {
            isCustomElement: (tag) => tag === 'solid-vcard-card'
        }
    },
    app: {
        head: {
            link: [
                {
                    rel: 'webmention',
                    href: 'https://stargazer.kilianleroy.ikdoeict.be/api/webmentions'
                },
                {
                    rel: 'me',
                    href: 'https://stargazer.kilianleroy.ikdoeict.be/'
                },
                {
                    rel: 'me',
                    href: 'https://github.com/KilianLeroy'
                }
            ]
        }
    }
})