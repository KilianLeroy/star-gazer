/**
 * SPARQL Query utility for Wikidata
 * Enables querying Wikidata using SPARQL language
 */

/**
 * Configuration for Wikidata SPARQL endpoint
 */
const WIKIDATA_SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql'

/**
 * Execute a SPARQL query against Wikidata
 * @param query - The SPARQL query string
 * @param format - Response format (json, xml, turtle, etc.)
 * @returns Promise containing the query results
 */
export async function executeSparqlQuery(
  query: string,
  format: 'json' | 'xml' | 'turtle' | 'csv' = 'json'
): Promise<any> {
  try {
    const params = new URLSearchParams({
      query: query,
      format: format,
    })

    const response = await fetch(`${WIKIDATA_SPARQL_ENDPOINT}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Accept: getAcceptHeader(format),
        'User-Agent': 'Star-Gazer-App/1.0 (Mythology Visualization)',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`SPARQL query failed with status ${response.status}: ${errorText}`)
    }

    if (format === 'json') {
        return await response.json()
    }
    return await response.text()
  } catch (error) {
    console.error('SPARQL Query Error:', error)
    throw error
  }
}

/**
 * Get the appropriate Accept header for the response format
 */
function getAcceptHeader(format: string): string {
  const headers: Record<string, string> = {
    json: 'application/sparql-results+json',
    xml: 'application/sparql-results+xml',
    turtle: 'text/turtle',
    csv: 'text/csv',
  }
  return headers[format] || 'application/sparql-results+json'
}

/**
 * Transform raw SPARQL results into structured data
 */
export function transformSparqlResults(results: any): any[] {
  if (!results.results || !results.results.bindings) {
    return []
  }

  return results.results.bindings
}

/**
 * Extract the label from a Wikidata result
 */
export function extractLabel(item: any): string {
  if (item.label && item.label.value) {
    return item.label.value
  }
  if (item.itemLabel && item.itemLabel.value) {
    return item.itemLabel.value
  }
  return 'Unknown'
}

/**
 * Extract the URI ID from a Wikidata result
 */
export function extractWikidataId(item: any): string {
  if (item.item && item.item.value) {
    return item.item.value.split('/').pop() || ''
  }
  return ''
}

