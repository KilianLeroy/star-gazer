<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Webmention {
  id: string
  source: string
  target: string
  timestamp: string
  verified: boolean
  type?: 'mention' | 'reply' | 'like' | 'repost'
  author?: {
    name?: string
    photo?: string
    url?: string
  }
  content?: {
    text?: string
    html?: string
  }
}

interface Props {
  target?: string
  autoLoad?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoLoad: true
})

const webmentions = ref<Webmention[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const mentions = computed(() => webmentions.value.filter(wm => wm.type === 'mention' || !wm.type))
const replies = computed(() => webmentions.value.filter(wm => wm.type === 'reply'))
const likes = computed(() => webmentions.value.filter(wm => wm.type === 'like'))
const reposts = computed(() => webmentions.value.filter(wm => wm.type === 'repost'))

const loadWebmentions = async () => {
  isLoading.value = true
  error.value = null

  try {
    const query = props.target ? `?target=${encodeURIComponent(props.target)}` : ''
    const response = await $fetch<{ success: boolean; webmentions: Webmention[] }>(
      `/api/webmentions${query}`
    )

    if (response.success) {
      webmentions.value = response.webmentions
    }
  } catch (err: any) {
    console.error('Error loading webmentions:', err)
    error.value = 'Failed to load webmentions'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  if (props.autoLoad) {
    loadWebmentions()
  }
})

defineExpose({
  loadWebmentions
})
</script>

<template>
  <div class="webmentions-display">
    <div v-if="isLoading" class="loading">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
      <span>Loading webmentions...</span>
    </div>

    <div v-else-if="error" class="error">
      <UIcon name="i-heroicons-exclamation-triangle" />
      <span>{{ error }}</span>
    </div>

    <div v-else-if="webmentions.length === 0" class="empty">
      <UIcon name="i-heroicons-chat-bubble-left-right" class="empty-icon" />
      <p>No webmentions yet. Be the first to mention this page!</p>
    </div>

    <div v-else class="webmentions-content">
      <!-- Summary stats -->
      <div class="webmentions-stats">
        <div v-if="likes.length > 0" class="stat">
          <UIcon name="i-heroicons-heart" class="text-red-500" />
          <span>{{ likes.length }} {{ likes.length === 1 ? 'like' : 'likes' }}</span>
        </div>
        <div v-if="reposts.length > 0" class="stat">
          <UIcon name="i-heroicons-arrow-path-rounded-square" class="text-green-500" />
          <span>{{ reposts.length }} {{ reposts.length === 1 ? 'repost' : 'reposts' }}</span>
        </div>
        <div v-if="replies.length > 0" class="stat">
          <UIcon name="i-heroicons-chat-bubble-left" class="text-blue-500" />
          <span>{{ replies.length }} {{ replies.length === 1 ? 'reply' : 'replies' }}</span>
        </div>
        <div v-if="mentions.length > 0" class="stat">
          <UIcon name="i-heroicons-link" class="text-gray-500" />
          <span>{{ mentions.length }} {{ mentions.length === 1 ? 'mention' : 'mentions' }}</span>
        </div>
      </div>

      <!-- Replies and mentions (full display) -->
      <div v-if="replies.length > 0 || mentions.length > 0" class="webmentions-list">
        <h3 class="section-title">Replies & Mentions</h3>
        <div v-for="wm in [...replies, ...mentions]" :key="wm.id" class="webmention-item">
          <div class="webmention-header">
            <div class="author-info">
              <img
                v-if="wm.author?.photo"
                :src="wm.author.photo"
                :alt="wm.author.name || 'Anonymous'"
                class="author-photo"
              />
              <div v-else class="author-photo-placeholder">
                <UIcon name="i-heroicons-user" />
              </div>
              <div class="author-details">
                <a
                  v-if="wm.author?.url"
                  :href="wm.author.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="author-name"
                >
                  {{ wm.author.name || 'Anonymous' }}
                </a>
                <span v-else class="author-name">{{ wm.author?.name || 'Anonymous' }}</span>
                <span class="webmention-type">{{ wm.type === 'reply' ? 'replied' : 'mentioned this' }}</span>
              </div>
            </div>
            <time :datetime="wm.timestamp" class="webmention-date">
              {{ formatDate(wm.timestamp) }}
            </time>
          </div>

          <div v-if="wm.content" class="webmention-content">
            <div v-if="wm.content.html" v-html="wm.content.html" class="content-html"></div>
            <p v-else-if="wm.content.text">{{ wm.content.text }}</p>
          </div>

          <a :href="wm.source" target="_blank" rel="noopener noreferrer" class="webmention-source">
            View original <UIcon name="i-heroicons-arrow-top-right-on-square" />
          </a>
        </div>
      </div>

      <!-- Likes (compact display) -->
      <div v-if="likes.length > 0" class="webmentions-compact">
        <h3 class="section-title">Likes</h3>
        <div class="compact-list">
          <a
            v-for="wm in likes"
            :key="wm.id"
            :href="wm.author?.url || wm.source"
            target="_blank"
            rel="noopener noreferrer"
            class="compact-item"
            :title="wm.author?.name || 'Anonymous'"
          >
            <img
              v-if="wm.author?.photo"
              :src="wm.author.photo"
              :alt="wm.author.name || 'Anonymous'"
              class="compact-photo"
            />
            <div v-else class="compact-photo-placeholder">
              <UIcon name="i-heroicons-user" />
            </div>
          </a>
        </div>
      </div>

      <!-- Reposts (compact display) -->
      <div v-if="reposts.length > 0" class="webmentions-compact">
        <h3 class="section-title">Reposts</h3>
        <div class="compact-list">
          <a
            v-for="wm in reposts"
            :key="wm.id"
            :href="wm.author?.url || wm.source"
            target="_blank"
            rel="noopener noreferrer"
            class="compact-item"
            :title="wm.author?.name || 'Anonymous'"
          >
            <img
              v-if="wm.author?.photo"
              :src="wm.author.photo"
              :alt="wm.author.name || 'Anonymous'"
              class="compact-photo"
            />
            <div v-else class="compact-photo-placeholder">
              <UIcon name="i-heroicons-user" />
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.webmentions-display {
  width: 100%;
}

.loading,
.error,
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}

.error {
  color: #ef4444;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  opacity: 0.5;
}

.webmentions-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.webmentions-stats {
  display: flex;
  gap: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.5rem;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.webmentions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.webmention-item {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.webmention-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.webmention-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.author-info {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.author-photo,
.author-photo-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
}

.author-photo {
  object-fit: cover;
}

.author-photo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.author-name {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
}

a.author-name:hover {
  text-decoration: underline;
}

.webmention-type {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
}

.webmention-date {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
}

.webmention-content {
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.content-html {
  word-wrap: break-word;
}

.content-html :deep(a) {
  color: #60a5fa;
  text-decoration: underline;
}

.webmention-source {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #60a5fa;
  text-decoration: none;
}

.webmention-source:hover {
  text-decoration: underline;
}

.webmentions-compact {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.compact-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.compact-item {
  text-decoration: none;
  transition: transform 0.2s;
}

.compact-item:hover {
  transform: scale(1.1);
}

.compact-photo,
.compact-photo-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.compact-photo {
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.compact-photo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.1);
}
</style>

