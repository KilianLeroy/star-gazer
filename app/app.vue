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
      href: '/api/webmentions'
    }
  ]
})
</script>