/**
 * Vue composable for fetching and managing SPARQL query results
 */
import { ref, computed } from 'vue'
import { executeSparqlQuery, transformSparqlResults } from '~/utils/sparqlQuery'

export interface SparqlResult {
  [key: string]: {
    value: string
    type: string
  }
}

export function useSparqlQuery(initialQuery?: string) {
  const query = ref(initialQuery || '')
  const results = ref<SparqlResult[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Execute the current SPARQL query
   */
  async function executeQuery() {
    if (!query.value.trim()) {
      error.value = new Error('Query cannot be empty')
      return
    }

    loading.value = true
    error.value = null

    try {
      console.log('Executing SPARQL query:', query.value.substring(0, 100) + '...')
      const rawResults = await executeSparqlQuery(query.value, 'json')
      console.log('Raw SPARQL results:', rawResults)

      results.value = transformSparqlResults(rawResults)
      console.log('Transformed results:', results.value)
      console.log('Formatted results length:', results.value.length)
    } catch (err) {
      console.error('Query execution error:', err)
      error.value = err instanceof Error ? err : new Error('Unknown error occurred')
      results.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Execute a specific query
   */
  async function executeSpecificQuery(sparqlQuery: string) {
    query.value = sparqlQuery
    await executeQuery()
  }

  /**
   * Get a specific variable from results
   */
  const getVariable = (variableName: string) => {
    return results.value
      .map((result) => result[variableName]?.value)
      .filter((value) => value !== undefined)
  }

  /**
   * Format results for display
   */
  const formattedResults = computed<Record<string, string>[]>(() => {
    return results.value.map((result) => {
      const formatted: Record<string, string> = {}
      for (const [key, val] of Object.entries(result)) {
        if (val && typeof val === 'object' && 'value' in val) {
          formatted[key] = String(val.value)
        } else {
          formatted[key] = String(val)
        }
      }
      return formatted
    })
  })

  return {
    query,
    results,
    loading,
    error,
    executeQuery,
    executeSpecificQuery,
    getVariable,
    formattedResults,
  }
}

