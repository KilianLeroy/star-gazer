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
}])

const colorMode = useColorMode()

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'dark' : 'dark'
  }
})
</script>

<template>
  <div class="border-b-2 border-default">
    <UContainer>
      <UHeader title="Star Gazer">
        <UNavigationMenu :items="items"/>
        <template #right>
          <UButton
              :icon="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
              variant="ghost"
              color="neutral"
              aria-label="Toggle theme"
              @click="isDark = !isDark"
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
