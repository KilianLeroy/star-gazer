<script setup lang="ts">

import type {NavigationMenuItem} from "#ui/components/NavigationMenu.vue";

const items = computed<NavigationMenuItem>(() => [{
  label: 'Home',
  to: '/',
}, {
  label: 'About',
  to: '/extra',
},{
  label: 'SPARQL testing',
  to: '/sparql-tester',
}
])

const toast = useToast()

const handleClick = () => {
  console.log('clicked')
  toast.add({
    title: 'Fuck you',
    description: 'Light mode is for pussies',
    color: 'error'

  })
}
</script>


<template>
  <div class="border-b-2 border-default">
    <UContainer>
      <UHeader title="Star Gazer">
        <UNavigationMenu :items="items"/>
        <template #right>
          <UButton
              icon="i-heroicons-moon"
              variant="ghost"
              color="neutral"
              aria-label="Toggle theme"
              :on-click="handleClick"
          />
        </template>
      </UHeader>
    </UContainer>
  </div>
  <main class="main">
    <UContainer>
      <slot/>
    </UContainer>
  </main>
</template>

<style scoped>
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>