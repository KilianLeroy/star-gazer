<script setup lang="ts">
import {onMounted, ref, computed} from "vue";
import {SolidVCardCard} from "@kiliankil/solid-vcard-card";
import WebmentionDisplay from "~/components/webmention/WebmentionDisplay.vue";
import WebmentionForm from "~/components/webmention/WebmentionForm.vue";

interface VisitationCardsResponse {
  success: boolean;
  cards: string[];
}

interface SubmitProfileResponse {
  success: boolean;
  message: string;
  totalCards: number;
}

const toast = useToast();

const profiles = ref<string[]>([]);
const newProfileUrl = ref<string>("");
const isLoading = ref<boolean>(false);

// Get current page URL for webmentions
const currentPageUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return '';
});

const onWebmentionSent = () => {
  toast.add({
    title: 'Webmention Sent',
    description: 'Your webmention has been received and will appear once verified!',
    color: 'success',
    icon: 'i-heroicons-check-circle'
  });
};

const loadProfiles = async () => {
  try {
    const response = await $fetch<VisitationCardsResponse>('/api/visitation-cards');
    if (response.success && Array.isArray(response.cards)) {
      profiles.value = response.cards;
    }
  } catch (error) {
    console.error('Error loading profiles:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to load visitation cards',
      color: 'warning',
      icon: 'i-heroicons-exclamation-circle'
    });
  }
};

const submitProfile = async () => {
  if (!newProfileUrl.value.trim()) {
    toast.add({
      title: 'Validation Error',
      description: 'Please enter a profile URL',
      color: 'warning',
      icon: 'i-heroicons-exclamation-triangle'
    });
    return;
  }

  isLoading.value = true;
  try {
    const response = await $fetch<SubmitProfileResponse>('/api/visitation-cards', {
      method: 'POST',
      body: {
        profile: newProfileUrl.value
      }
    });

    if (response.success) {
      toast.add({
        title: 'Success',
        description: `Profile added! Total cards: ${response.totalCards}`,
        color: 'success',
        icon: 'i-heroicons-check-circle'
      });
      newProfileUrl.value = "";
      await loadProfiles();
    }
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to save profile',
      color: 'warning',
      icon: 'i-heroicons-exclamation-circle'
    });
    console.error('Error saving profile:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (typeof window !== 'undefined' && !customElements.get('solid-vcard-card')) {
    customElements.define('solid-vcard-card', SolidVCardCard)
  }

  loadProfiles();
})
</script>

<template>
  <div class="container">
    <h1>Extra cool stuff</h1>

    <div class="section">
      <h2>Leave Your Visitation Card</h2>
      <UForm @submit="submitProfile" class="space-y-4">
        <UFormField label="Your Solid Pod Profile URL:">
          <UInput
              v-model="newProfileUrl"
              type="url"
              placeholder="e.g., https://storage.inrupt.com/your-id/profile"
              required
              :disabled="isLoading"
              icon="i-heroicons-link"
          />
        </UFormField>

        <UButton
            type="submit"
            :loading="isLoading"
            :disabled="isLoading"
            icon="i-heroicons-arrow-up-tray"
        >
          {{ isLoading ? 'Saving...' : 'Add My Profile' }}
        </UButton>
      </UForm>
    </div>

    <div class="section">
      <h2>Visitation Cards ({{ profiles.length }})</h2>
      <div v-if="profiles.length === 0" class="empty-state">
        <UIcon name="i-heroicons-inbox" class="w-12 h-12 mx-auto mb-4 opacity-50"/>
        <p>No visitation cards yet. Be the first to leave your profile!</p>
      </div>
      <div v-else class="visitation-cards">
        <solid-vcard-card v-for="(profile, index) in profiles" :key="index" :profile="profile"></solid-vcard-card>
      </div>
    </div>

    <div class="section">
      <h2>Webmentions</h2>
      <p class="section-description">
        Connect with others across the web using Webmentions - a standard for conversations between websites.
      </p>

      <!-- Form to submit webmentions -->
      <div class="webmention-submit-section">
        <WebmentionForm
          :target="currentPageUrl"
          @sent="onWebmentionSent"
        />
      </div>

      <!-- Display received webmentions -->
      <div class="webmention-display-section">
        <h3>Received Webmentions</h3>
        <WebmentionDisplay
          :target="currentPageUrl"
          :auto-load="true"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.section {
  margin-bottom: 3rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

h1 {
  margin-bottom: 2rem;
  font-size: 2.25rem;
  font-weight: 700;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
}

.visitation-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: space-evenly;
}

.section-description {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.webmention-submit-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.webmention-display-section {
  padding-top: 1rem;
}

.webmention-display-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
}


</style>