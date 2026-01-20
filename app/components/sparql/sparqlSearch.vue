<script setup lang="ts">
import { computed, watch, withDefaults } from 'vue'
import { buildDeityQuery } from '~/data/sparqlQueries'
import { useSparqlSearchStore } from '~/composables/useSparqlSearchStore'

const emit = defineEmits<{
  (e: 'query', value: string): void
  (e: 'results', value: Record<string, string>[]): void
  (e: 'run', value: string): void
  (e: 'pure-filter', value: boolean): void
}>()

const props = withDefaults(defineProps<{ showPureDomainsToggle?: boolean }>(), {
  showPureDomainsToggle: true,
})

const deityTypes = [
  { label: 'Greek', value: 'wd:Q22989102' },
  { label: 'Norse', value: 'wd:Q16513881' },
  { label: 'Egyptian', value: 'wd:Q146083' },
  { label: 'Hindu', value: 'wd:Q979507' },
  { label: 'Celtic', value: 'wd:Q465434' },
]

const {
  selectedTypes,
  includeDomain,
  requireDomain,
  includeFamily,
  includeImage,
  includeArticle,
  includeDescription,
  limit,
  orderBy,
  extraFilters,
  pureDomainsOnly,
} = useSparqlSearchStore()

const builtQuery = computed(() =>
  buildDeityQuery({
    instanceIds: selectedTypes.value,
    includeDomain: includeDomain.value,
    requireDomain: requireDomain.value,
    includeFamily: includeFamily.value,
    includeImage: includeImage.value,
    includeArticle: includeArticle.value,
    includeDescription: includeDescription.value,
    extraFilters: extraFilters.value,
    limit: limit.value,
    orderBy: orderBy.value,
  })
)

watch(builtQuery, (q) => emit('query', q), { immediate: true })
watch(pureDomainsOnly, (val) => emit('pure-filter', val), { immediate: true })

function runQuery() {
  emit('run', builtQuery.value)
}
</script>

<template>
  <div class="sparql-search">
    <h2>SPARQL Deity Search</h2>

    <UForm class="controls">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <UFormField label="Deity types (multi)">
          <USelect
            v-model="selectedTypes"
            :items="deityTypes"
            value-attribute="value"
            option-attribute="label"
            multiple
            placeholder="Select one or more deity types"
          />
        </UFormField>

        <UFormField label="Limit">
          <UInput v-model.number="limit" type="number" min="1" max="500" />
        </UFormField>

        <UFormField label="Order by (space separated)">
          <UInput
            type="text"
            :model-value="orderBy.join(' ')"
            @update:model-value="(val: string) => (orderBy = val.split(' ').filter(Boolean))"
            placeholder="?deityLabel"
          />
        </UFormField>

        <UFormField class="sm:col-span-2 lg:col-span-3" label="Extra FILTER / graph patterns">
          <UTextarea
            v-model="extraFilters"
            :rows="3"
            placeholder="?deity wdt:P17 wd:Q38 ."
          />
        </UFormField>

        <UCard class="sm:col-span-2 lg:col-span-3">
          <template #header>
            <h3 class="text-lg font-semibold">Include</h3>
          </template>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <UCheckbox v-model="includeDomain" label="Include Domain" />
            <UCheckbox v-model="requireDomain" :disabled="!includeDomain" label="Only gods with domain" />
            <UCheckbox
              v-if="props.showPureDomainsToggle"
              v-model="pureDomainsOnly"
              :disabled="!includeDomain"
              label="Only dense domains (≥3)"
            />
            <UCheckbox v-model="includeFamily" label="Family (parents/children)" />
            <UCheckbox v-model="includeImage" label="Image" />
            <UCheckbox v-model="includeArticle" label="Wikipedia article" />
            <UCheckbox v-model="includeDescription" label="Description" />
          </div>
        </UCard>
      </div>

      <div class="mt-3">
        <UButton icon="i-heroicons-play-20-solid" @click="runQuery">Run query</UButton>
      </div>
    </UForm>
  </div>
</template>

<style scoped>
.sparql-search {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
