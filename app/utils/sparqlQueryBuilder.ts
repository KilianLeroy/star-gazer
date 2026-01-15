/**
 * Lightweight, composable SPARQL query builder.
 * Designed to make Wikidata queries readable and easy to extend with pluggable blocks.
 */
export type PrefixMap = Record<string, string>

export const DEFAULT_WIKIDATA_PREFIXES: PrefixMap = {
  wd: 'http://www.wikidata.org/entity/',
  wdt: 'http://www.wikidata.org/prop/direct/',
  p: 'http://www.wikidata.org/prop/',
  ps: 'http://www.wikidata.org/prop/statement/',
  pq: 'http://www.wikidata.org/prop/qualifier/',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  schema: 'http://schema.org/',
  bd: 'http://www.bigdata.com/rdf#',
  wikibase: 'http://wikiba.se/ontology#',
}

/** Utility to create a UNION block from N patterns */
export function createUnionBlock(blocks: string[]): string {
  const cleaned = blocks.map((b) => b.trim()).filter(Boolean)
  if (!cleaned.length) return ''
  return cleaned
    .map((block) => `{
${indentBlock(block)}
}`)
    .join(' UNION ')
}

/** Indent a block with two spaces for readability */
function indentBlock(block: string): string {
  return block
    .split('\n')
    .map((line) => (line.trim() ? `  ${line}` : line))
    .join('\n')
}

export class SparqlQueryBuilder {
  private prefixes = new Map<string, string>()
  private selectClauses: string[] = []
  private whereClauses: string[] = []
  private optionalClauses: string[] = []
  private filterClauses: string[] = []
  private serviceBlocks: string[] = []
  private groupByClauses: string[] = []
  private orderByClauses: string[] = []
  private limitCount?: number
  private offsetCount?: number

  constructor(prefixes: PrefixMap = DEFAULT_WIKIDATA_PREFIXES) {
    this.addPrefixes(prefixes)
  }

  /** Add a single PREFIX */
  addPrefix(prefix: string, iri: string): this {
    if (prefix && iri) {
      this.prefixes.set(prefix, iri)
    }
    return this
  }

  /** Add multiple PREFIX declarations */
  addPrefixes(prefixes: PrefixMap): this {
    Object.entries(prefixes).forEach(([p, iri]) => this.addPrefix(p, iri))
    return this
  }

  /** SELECT fields or expressions */
  select(...fields: string[]): this {
    this.selectClauses.push(...fields.filter(Boolean).map((f) => f.trim()))
    return this
  }

  /** Mandatory graph patterns */
  where(pattern: string): this {
    const trimmed = pattern.trim()
    if (trimmed) {
      this.whereClauses.push(trimmed)
    }
    return this
  }

  /** OPTIONAL graph patterns; wraps with OPTIONAL { ... } when not already */
  optional(block: string): this {
    const trimmed = block.trim()
    if (!trimmed) return this
    const clause = /^OPTIONAL\b/i.test(trimmed)
      ? trimmed
      : `OPTIONAL {\n${indentBlock(trimmed)}\n}`
    this.optionalClauses.push(clause)
    return this
  }

  /** FILTER expression; auto-wraps in FILTER(...) unless already provided */
  filter(expression: string): this {
    const trimmed = expression.trim()
    if (!trimmed) return this
    const clause = /^FILTER\b/i.test(trimmed) ? trimmed : `FILTER (${trimmed})`
    this.filterClauses.push(clause)
    return this
  }

  /** SERVICE wikibase:label helper */
  serviceLabel(lines: string[], language: string | string[] = 'en'): this {
    const lang = Array.isArray(language) ? language.join(',') : language
    const body = ['SERVICE wikibase:label {', `  bd:serviceParam wikibase:language "${lang}".`, ...lines.map((l) => `  ${l.trim()}`), '}']
    this.serviceBlocks.push(body.join('\n'))
    return this
  }

  groupBy(...fields: string[]): this {
    this.groupByClauses.push(...fields.filter(Boolean).map((f) => f.trim()))
    return this
  }

  orderBy(...fields: string[]): this {
    this.orderByClauses.push(...fields.filter(Boolean).map((f) => f.trim()))
    return this
  }

  limit(limit?: number): this {
    if (typeof limit === 'number') {
      this.limitCount = limit
    }
    return this
  }

  offset(offset?: number): this {
    if (typeof offset === 'number') {
      this.offsetCount = offset
    }
    return this
  }

  /** Render the SPARQL query string */
  build(): string {
    const prefixBlock = this.buildPrefixes()
    const selectBlock = this.buildSelect()
    const whereBlock = this.buildWhere()
    const groupByBlock = this.groupByClauses.length ? `GROUP BY ${this.groupByClauses.join(' ')}` : ''
    const orderByBlock = this.orderByClauses.length ? `ORDER BY ${this.orderByClauses.join(' ')}` : ''
    const limitBlock = typeof this.limitCount === 'number' ? `LIMIT ${this.limitCount}` : ''
    const offsetBlock = typeof this.offsetCount === 'number' ? `OFFSET ${this.offsetCount}` : ''

    return [prefixBlock, selectBlock, whereBlock, groupByBlock, orderByBlock, limitBlock, offsetBlock]
      .filter(Boolean)
      .join('\n')
  }

  private buildPrefixes(): string {
    if (!this.prefixes.size) return ''
    return Array.from(this.prefixes.entries())
      .map(([prefix, iri]) => `PREFIX ${prefix}: <${iri}>`)
      .join('\n')
  }

  private buildSelect(): string {
    if (!this.selectClauses.length) return 'SELECT *'
    return ['SELECT', ...this.selectClauses.map((c) => `  ${c}`)].join('\n')
  }

  private buildWhere(): string {
    const lines: string[] = []
    lines.push(...this.whereClauses)
    lines.push(...this.filterClauses)
    lines.push(...this.optionalClauses)
    lines.push(...this.serviceBlocks)
    if (!lines.length) return ''
    return ['WHERE {', ...lines.map((l) => `  ${l}`), '}'].join('\n')
  }
}

