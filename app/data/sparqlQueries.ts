/**
 * Example SPARQL queries for mythology data from Wikidata
 * These queries can be used to fetch mythology-related data
 */

import {DEFAULT_WIKIDATA_PREFIXES, SparqlQueryBuilder, createUnionBlock} from '~/utils/sparqlQueryBuilder'

/**
 * Rich deity detail query builder using Wikidata
 * Includes description, family (parents/children), domains, image, and English Wikipedia article
 */
export interface DeityQueryOptions {
    /** Instance-of class for the deity (default: Greek deity) */
    instanceId?: string
    /** Additional FILTER/graph patterns injected into the WHERE block */
    extraFilters?: string
    /** Maximum rows to return */
    limit?: number
    /** Include domain information */
    includeDomain?: boolean
    /** Include family information (parents/children) */
    includeFamily?: boolean
    /** Include image information */
    includeImage?: boolean
    /** Include Wikipedia article information */
    includeArticle?: boolean
    /** Include description information */
    includeDescription?: boolean
    /** Custom order by fields */
    orderBy?: string[]
}

const DEFAULT_INSTANCE = 'wd:Q16513881' // Greek deity

// Modular building blocks for the deity query
export const DEITY_QUALITY_FILTERS = [
    'EXISTS { ?deity rdfs:label ?label . FILTER (lang(?label) = "en") }',
    'EXISTS { ?deity schema:description ?desc . FILTER (lang(?desc) = "en") }',
    `
    EXISTS { ?deity wdt:P22 ?_f } ||
    EXISTS { ?deity wdt:P25 ?_m } ||
    EXISTS { ?deity wdt:P40 ?_c }
  `,
    `EXISTS {
    ?article schema:about ?deity ;
             schema:isPartOf <https://en.wikipedia.org/>.
  }`,
]

export const DEITY_DESCRIPTION_OPTIONAL = `
  ?deity schema:description ?description .
  FILTER (lang(?description) = "en")
`

export const DEITY_FAMILY_OPTIONALS = ['?deity wdt:P22 ?father', '?deity wdt:P25 ?mother', '?deity wdt:P40 ?child']

export const DEITY_DOMAIN_UNION = createUnionBlock([
    '?deity wdt:P2925 ?domain .',
    `?deity wdt:P31 ?deityType .\n?deityType wdt:P279* wd:Q178885 .\n?deityType wdt:P2925 ?domain .`,
    `?deity wdt:P31 ?deityType .\n?deityType wdt:P279* wd:Q178885 .\n?deityType wdt:P921 ?domain .`,
])

export const DEITY_IMAGE_OPTIONAL = '?deity wdt:P18 ?image'

export const DEITY_WIKIPEDIA_OPTIONAL = `
  ?article schema:about ?deity ;
           schema:isPartOf <https://en.wikipedia.org/>.
`

export function buildDeityQuery({
  instanceId = DEFAULT_INSTANCE,
  extraFilters = '',
  limit = 200,
  includeDomain = true,
  includeFamily = true,
  includeImage = true,
  includeArticle = true,
  includeDescription = true,
  orderBy = ['?deityLabel'],
}: DeityQueryOptions = {}): string {
  const builder = new SparqlQueryBuilder(DEFAULT_WIKIDATA_PREFIXES)

  // Build SELECT list based on toggles
  const selectFields: string[] = ['?deity ?deityLabel']
  if (includeDescription) selectFields.push('(SAMPLE(?description) AS ?description)')
  if (includeFamily) {
    selectFields.push(
      '(GROUP_CONCAT(DISTINCT ?fatherLabel; separator=", ") AS ?fathers)',
      '(GROUP_CONCAT(DISTINCT ?motherLabel; separator=", ") AS ?mothers)',
      '(GROUP_CONCAT(DISTINCT ?childLabel; separator=", ") AS ?children)'
    )
  }
  if (includeDomain) selectFields.push('(GROUP_CONCAT(DISTINCT ?domainLabel; separator=", ") AS ?domains)')
  if (includeImage) selectFields.push('(SAMPLE(?image) AS ?image)')
  if (includeArticle) selectFields.push('?article')

  builder.select(...selectFields).where(`?deity wdt:P31 ${instanceId} .`)

  if (extraFilters) builder.where(extraFilters)

  // Quality filters stay the same (ensure description filter is only applied if description requested)
  DEITY_QUALITY_FILTERS.forEach((f) => {
    if (!includeDescription && f.includes('schema:description')) return
    builder.filter(f)
  })

  // Optional blocks based on toggles
  if (includeDescription) builder.optional(DEITY_DESCRIPTION_OPTIONAL)
  if (includeFamily) DEITY_FAMILY_OPTIONALS.forEach((opt) => builder.optional(opt))
  if (includeDomain) builder.optional(DEITY_DOMAIN_UNION)
  if (includeImage) builder.optional(DEITY_IMAGE_OPTIONAL)
  if (includeArticle) builder.optional(DEITY_WIKIPEDIA_OPTIONAL)

  // SERVICE label lines based on toggles
  const serviceLines = ['?deity rdfs:label ?deityLabel.']
  if (includeFamily) {
    serviceLines.push(
      '?father rdfs:label ?fatherLabel .',
      '?mother rdfs:label ?motherLabel .',
      '?child  rdfs:label ?childLabel .'
    )
  }
  if (includeDomain) serviceLines.push('?domain rdfs:label ?domainLabel .')

  builder.serviceLabel(serviceLines, 'en')

  // GROUP BY must include selected non-aggregated variables
  const groupBy: string[] = ['?deity', '?deityLabel']
  if (includeArticle) groupBy.push('?article')

  builder.groupBy(...groupBy).orderBy(...orderBy).limit(limit)

  return builder.build()
}

// Predefined culture-specific deity queries using the rich template
export const GREEK_GODS_QUERY = buildDeityQuery({instanceId: 'wd:Q22989102'})
export const NORSE_GODS_QUERY = buildDeityQuery({instanceId: 'wd:Q16513881'})
export const EGYPTIAN_GODS_QUERY = buildDeityQuery({instanceId: 'wd:Q146083'})
export const HINDU_GODS_QUERY = buildDeityQuery({instanceId: 'wd:Q979507'})
export const CELTIC_GODS_QUERY = buildDeityQuery({
    // Use generic deity class but restrict to Ireland/UK region
    instanceId: 'wd:Q465434',
    extraFilters: '?deity (wdt:P17|wdt:P131) wd:Q27 .',
})

// Relationships and family queries kept for specialized use cases
export const MYTHOLOGY_RELATIONSHIPS_QUERY = new SparqlQueryBuilder()
    .select('?subject ?subjectLabel ?property ?propertyLabel ?object ?objectLabel')
    .where('?subject wdt:P31 wd:Q11014 .')
    .where('?subject ?property ?object .')
    .where('?object wdt:P31 wd:Q11014 .')
    .serviceLabel([], 'en')
    .limit(50)
    .build()

export const MYTHOLOGY_FAMILY_QUERY = new SparqlQueryBuilder()
    .select('?item ?itemLabel ?relative ?relativeLabel ?relationshipLabel')
    .where('?item wdt:P31 wd:Q11014 .')
    .where('?item (wdt:P22 | wdt:P25 | wdt:P26 | wdt:P40 | wdt:P3373) ?relative .')
    .where('?relative wdt:P31 wd:Q11014 .')
    .serviceLabel([], 'en')
    .limit(100)
    .build()

export function generateMythologyQuery(cultureId: string): string {
    return buildDeityQuery({
        instanceId: cultureId,
        limit: 50,
    })
}
