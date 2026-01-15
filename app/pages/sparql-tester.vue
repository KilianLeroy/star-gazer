<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSparqlQuery } from '~/composables/useSparqlQuery'
import SparqlSearch from '~/components/sparql/sparqlSearch.vue'

const { query, results, loading, error, executeQuery, formattedResults } = useSparqlQuery()

const searchQuery = ref('')
function onSearchQuery(q: string) {
  searchQuery.value = q
}
async function onRun(q: string) {
  query.value = q
  await executeQuery()
}

watch(searchQuery, (q) => {
  query.value = q
}, { immediate: true })

const rows = computed<Record<string, string>[]>(() => formattedResults.value as Record<string, string>[])
const headers = computed(() => (rows.value.length ? Object.keys(rows.value[0] || {}) : []))

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url
  }
}
</script>

<template>
  <div class="min-h-screen">
    <UContainer class="py-12">
      <div class="mb-12">
        <h1 class="text-4xl font-bold text-white mb-2">SPARQL Query Tester</h1>
        <p class="text-slate-400">Query Wikidata mythology information using SPARQL</p>
      </div>

      <UCard class="mb-8">
        <template #header>
          <h2 class="text-2xl font-semibold">Build & Execute Deity Search</h2>
        </template>
        <SparqlSearch @query="onSearchQuery" @run="onRun" />
      </UCard>

      <UCard class="mb-8">
        <template #header>
          <h2 class="text-2xl font-semibold">Custom SPARQL Query</h2>
        </template>

        <div class="space-y-8">
          <UTextarea
            v-model="query"
            class="w-full"
            placeholder="Enter your SPARQL query here..."
            :rows="24"
            autofocus
          />
          <div class="flex gap-2">
            <UButton
              @click="executeQuery"
              :loading="loading"
              color="primary"
              size="lg"
              icon="i-heroicons-play-20-solid"
            >
              Execute Query
            </UButton>
            <UButton
              color="neutral"
              size="lg"
              to="https://query.wikidata.org/"
              target="_blank"
              icon="i-heroicons-arrow-top-right-on-square-20-solid"
            >
              Open in Wikidata
            </UButton>
          </div>
        </div>
      </UCard>

      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-semibold">Results</h2>
            <UBadge v-if="formattedResults.length > 0" color="primary" variant="subtle">
              {{ formattedResults.length }} results
            </UBadge>
          </div>
        </template>

        <UAlert
          v-if="error"
          color="warning"
          variant="soft"
          icon="i-heroicons-exclamation-triangle-20-solid"
          title="Error"
          :description="error.message"
          class="mb-6"
        />

        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
          <UIcon name="i-heroicons-arrow-path-20-solid" class="w-8 h-8 animate-spin text-primary mb-4" />
          <p class="text-slate-400">Executing query...</p>
        </div>

        <div v-else-if="rows && rows.length > 0" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-700">
                <th v-for="key in headers" :key="key" class="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                  {{ key }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in rows" :key="idx" class="border-b border-slate-100 dark:border-slate-800 hover:bg-primary/5 transition-colors">
                <td v-for="key in headers" :key="key" class="px-4 py-3 text-slate-700 dark:text-slate-300">
                  <ULink v-if="row[key] && (row[key] as string).startsWith('http')" :to="row[key]" target="_blank" color="primary" class="underline">
                    {{ extractDomain(row[key]) }}
                  </ULink>
                  <span v-else class="break-words">{{ row[key] || '-' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="!loading && query" class="flex flex-col items-center justify-center py-12">
          <UIcon name="i-heroicons-magnifying-glass-20-solid" class="w-8 h-8 text-slate-400 mb-4" />
          <p class="text-slate-400">No results found. Try a different query.</p>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-12">
          <UIcon name="i-heroicons-sparkles-20-solid" class="w-8 h-8 text-slate-400 mb-4" />
          <p class="text-slate-400">Use the builder to generate a query or enter your own.</p>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>
