/**
 * Composable to store and persist SPARQL search form state across component remounts
 */
import { ref } from 'vue'

// Global refs that persist across component remounts
const storedSelectedTypes = ref<string[]>(['wd:Q22989102']) // Default to Greek
const storedIncludeDomain = ref(true)
const storedRequireDomain = ref(false)
const storedIncludeFamily = ref(true)
const storedIncludeImage = ref(true)
const storedIncludeArticle = ref(true)
const storedIncludeDescription = ref(true)
const storedLimit = ref(100)
const storedOrderBy = ref<string[]>(['?deityLabel'])
const storedExtraFilters = ref('')
const storedPureDomainsOnly = ref(false)

export function useSparqlSearchStore() {
  return {
    selectedTypes: storedSelectedTypes,
    includeDomain: storedIncludeDomain,
    requireDomain: storedRequireDomain,
    includeFamily: storedIncludeFamily,
    includeImage: storedIncludeImage,
    includeArticle: storedIncludeArticle,
    includeDescription: storedIncludeDescription,
    limit: storedLimit,
    orderBy: storedOrderBy,
    extraFilters: storedExtraFilters,
    pureDomainsOnly: storedPureDomainsOnly,
  }
}

