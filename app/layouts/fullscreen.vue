<script setup lang="ts">

</script>

<template>
  <div class="fullscreen-layout">
    <slot />
  </div>
</template>

<style scoped>
.fullscreen-layout {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
  z-index: 9999;
}

.fullscreen-layout > * {
  width: 100%;
  height: 100%;
}
</style>

