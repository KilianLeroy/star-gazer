<script setup lang="ts">
import { ref, computed } from 'vue'

const toast = useToast()

interface Props {
  target?: string
}

const props = defineProps<Props>()

const sourceUrl = ref('')
const isLoading = ref(false)

const emit = defineEmits<{
  (e: 'sent'): void
}>()

const currentTarget = computed(() => {
  if (props.target) return props.target
  if (typeof window !== 'undefined') {
    return window.location.href
  }
  return ''
})

const submitWebmention = async () => {
  if (!sourceUrl.value.trim()) {
    toast.add({
      title: 'Validation Error',
      description: 'Please enter your page URL',
      color: 'warning',
      icon: 'i-heroicons-exclamation-triangle'
    })
    return
  }

  if (!currentTarget.value) {
    toast.add({
      title: 'Error',
      description: 'Cannot determine target URL',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
    return
  }

  isLoading.value = true

  try {
    await $fetch('/api/webmentions', {
      method: 'POST',
      body: {
        source: sourceUrl.value,
        target: currentTarget.value
      }
    })

    toast.add({
      title: 'Success',
      description: 'Your webmention has been received! It will appear once verified.',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })

    sourceUrl.value = ''
    emit('sent')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.statusMessage || 'Failed to submit webmention',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle'
    })
    console.error('Error submitting webmention:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="webmention-form">
    <h3 class="form-title">Mentioned This Page?</h3>
    <p class="form-description">
      If you've written about this page on your own site, let us know by submitting your page URL!
    </p>

    <UForm @submit="submitWebmention" class="form-content">
      <UFormField
        label="Your page URL:"
        description="The URL of your page that mentions this site"
      >
        <UInput
          v-model="sourceUrl"
          type="url"
          placeholder="https://yourblog.com/my-post"
          required
          :disabled="isLoading"
          icon="i-heroicons-link"
        />
      </UFormField>

      <UButton
        type="submit"
        :loading="isLoading"
        :disabled="isLoading"
        icon="i-heroicons-paper-airplane"
        block
      >
        {{ isLoading ? 'Submitting...' : 'Submit Webmention' }}
      </UButton>
    </UForm>

  </div>
</template>

<style scoped>
.webmention-form {
  width: 100%;
}

.form-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.form-description {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

</style>
