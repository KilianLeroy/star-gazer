<template>
  <UApp :toaster="{position: 'top-right'}">
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
useHead({
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
})
</script>