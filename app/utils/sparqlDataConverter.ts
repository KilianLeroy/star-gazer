/**
 * Converter utility to transform Wikidata SPARQL results
 * into the StarData format used by the mythology visualization
 */

import type {StarData} from '~/data/mythologyData'

export interface SparqlMythologyResult {
    deity?: { value: string }
    deityLabel?: { value: string }
    item?: { value: string }
    itemLabel?: { value: string }
    instance?: { value: string }
    description?: { value: string }
    image?: { value: string }
    culture?: { value: string }
    cultureLabel?: { value: string }

    [key: string]: any
}

// Map Wikidata instance IDs to mythology names
const instanceToMythology: Record<string, string> = {
    'http://www.wikidata.org/entity/Q22989102': 'Greek',
    'http://www.wikidata.org/entity/Q16513881': 'Norse',
    'http://www.wikidata.org/entity/Q146083': 'Egyptian',
    'http://www.wikidata.org/entity/Q979507': 'Hindu',
    'http://www.wikidata.org/entity/Q465434': 'Celtic',
    'wd:Q22989102': 'Greek',
    'wd:Q16513881': 'Norse',
    'wd:Q146083': 'Egyptian',
    'wd:Q979507': 'Hindu',
    'wd:Q465434': 'Celtic',
    'Q22989102': 'Greek',
    'Q16513881': 'Norse',
    'Q146083': 'Egyptian',
    'Q979507': 'Hindu',
    'Q465434': 'Celtic',
}

/**
 * Convert a Wikidata SPARQL result to StarData format
 */
export function convertSparqlToStarData(
    sparqlResult: SparqlMythologyResult,
    mythology: string,
    id: number,
    position?: { x: number; y: number; z: number }
): StarData {
    // Try multiple possible label fields
    const name = sparqlResult.deityLabel?.value
        || sparqlResult.itemLabel?.value
        || sparqlResult.deity?.value?.split('/').pop() // Extract from URI as fallback
        || sparqlResult.item?.value?.split('/').pop()
        || 'Unknown'

    // Try to extract mythology from instance field if available
    let detectedMythology = mythology
    if (sparqlResult.instance?.value) {
        const instanceValue = sparqlResult.instance.value
        detectedMythology = instanceToMythology[instanceValue] || mythology
    }

    return {
        id,
        name,
        mythology: detectedMythology,
        position: position || generateRandomPosition(),
        relations: [],
        description: sparqlResult.description?.value,
        image: sparqlResult.image?.value,
        domains: sparqlResult.domains?.value,
        fathers: sparqlResult.fathers?.value,
        mothers: sparqlResult.mothers?.value,
        children: sparqlResult.children?.value,
        article: sparqlResult.article?.value,
    }
}

/**
 * Convert multiple SPARQL results to StarData array with domain-based clustering
 */
export function convertMultipleSparqlResults(
    results: SparqlMythologyResult[],
    mythology: string,
    startId: number = 1,
    useDomainClustering: boolean = true
): StarData[] {
    const starDataArray = results.map((result, index) => {
        return convertSparqlToStarData(result, mythology, startId + index)
    })

    // If domain clustering is enabled, apply clustering and build relationships
    if (useDomainClustering) {
        return clusterByDomain(starDataArray)
    }

    // Fallback to simple distribution if not clustering
    return starDataArray.map((star, index) => {
        const angle = (index / starDataArray.length) * Math.PI * 2
        const radius = 5 + (index % 3) * 2
        return {
            ...star,
            position: {
                x: Math.cos(angle) * radius,
                y: 3 + Math.sin(index) * 2,
                z: Math.sin(angle) * radius,
            },
        }
    })
}

/**
 * Generate random 3D position for a mythology figure
 */
export function generateRandomPosition(
    minRadius: number = 0,
    maxRadius: number = 10
): { x: number; y: number; z: number } {
    const radius = minRadius + Math.random() * (maxRadius - minRadius)
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI

    return {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.cos(phi),
        z: radius * Math.sin(phi) * Math.sin(theta),
    }
}

/**
 * Map domains to colors for visual distinction
 */
const domainColorMap: Record<string, string> = {
    war: '#FF4444',
    love: '#FF69B4',
    wisdom: '#4169E1',
    sea: '#00CED1',
    sky: '#87CEEB',
    death: '#8B4513',
    fertility: '#228B22',
    magic: '#9932CC',
    trade: '#FFD700',
    craft: '#A9A9A9',
    hunt: '#8B7500',
    music: '#FF1493',
    wine: '#722F37',
    forge: '#696969',
    agriculture: '#90EE90',
    beauty: '#FFB6C1',
    justice: '#4B0082',
    night: '#191970',
    time: '#FF6347',
    nature: '#00AA00',
    healing: '#00e800',
    dream: '#0000FF',
    insanity: '#FF00FF',
    sun: "#FFD700"
}

function generateRandomDomainColor(): string {
  // Generate a bright random color
  const hue = Math.floor(Math.random() * 360)
  const saturation = 60 + Math.floor(Math.random() * 30) // 60-90%
  const lightness = 45 + Math.floor(Math.random() * 20) // 45-65%
  // Convert HSL to HEX quickly
  const h = hue / 360
  const s = saturation / 100
  const l = lightness / 100
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const toHex = (t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const r = Math.round(toHex(h + 1 / 3) * 255)
  const g = Math.round(toHex(h) * 255)
  const b = Math.round(toHex(h - 1 / 3) * 255)
  const toHexStr = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHexStr(r)}${toHexStr(g)}${toHexStr(b)}`
}

/**
 * Get color for a domain (assigns a random one if missing)
 */
export function getDomainColor(domain: string): string {
  const lowerDomain = domain.toLowerCase()
  if (!domainColorMap[lowerDomain]) {
    domainColorMap[lowerDomain] = generateRandomDomainColor()
  }
  return domainColorMap[lowerDomain]
}

/**
 * Group deities by their primary domain
 */
function groupByDomain(starData: StarData[]): Map<string, StarData[]> {
    const domainGroups = new Map<string, StarData[]>()

    starData.forEach((star) => {
        const domains = parseDomains(star.domains)
        const primaryDomain = domains[0] || 'unknown'

        if (!domainGroups.has(primaryDomain)) {
            domainGroups.set(primaryDomain, [])
        }
        domainGroups.get(primaryDomain)!.push(star)
    })

    return domainGroups
}

/**
 * Position stars in clusters based on their domain
 */
function clusterByDomain(starData: StarData[]): StarData[] {
    const domainGroups = groupByDomain(starData)
    const clusters = Array.from(domainGroups.entries())
    const clusterPositions: Record<string, { x: number; y: number; z: number }> = {}
    const result: StarData[] = []

    // Precompute domain co-occurrence to move clusters closer
    const domainAdjacency = new Map<string, Set<string>>()
    starData.forEach((star) => {
        const domains = parseDomains(star.domains)
        if (domains.length < 2) return
        for (let i = 0; i < domains.length; i++) {
            for (let j = i + 1; j < domains.length; j++) {
                const a = domains[i]
                const b = domains[j]
                if (!a || !b) continue
                if (!domainAdjacency.has(a)) domainAdjacency.set(a, new Set())
                if (!domainAdjacency.has(b)) domainAdjacency.set(b, new Set())
                domainAdjacency.get(a)!.add(b)
                domainAdjacency.get(b)!.add(a)
            }
        }
    })

    // Assign base random positions with minimum separation
    const placedCenters: Array<{ x: number; y: number; z: number }> = []
    clusters.forEach(([,], clusterIndex) => {
        const pos = generateClusterPosition(placedCenters)
        clusterPositions[clusterIndex] = pos
        placedCenters.push(pos)
    })

    // Slightly pull clusters that co-occur closer together
    clusters.forEach(([domainA], idxA) => {
        const adj = domainAdjacency.get(domainA)
        if (!adj) return
        adj.forEach((domainB) => {
            const idxB = clusters.findIndex(([d]) => d === domainB)
            if (idxB === -1) return
            const a = clusterPositions[idxA]
            const b = clusterPositions[idxB]
            if (!a || !b) return
            const blend = 0.1 // reduced blend to avoid overlap after separation
            const ax = a.x, ay = a.y, az = a.z
            a.x = ax * (1 - blend) + b.x * blend
            a.y = ay * (1 - blend) + b.y * blend
            a.z = az * (1 - blend) + b.z * blend
            b.x = b.x * (1 - blend) + ax * blend
            b.y = b.y * (1 - blend) + ay * blend
            b.z = b.z * (1 - blend) + az * blend
        })
    })

    // Position stars around their (possibly averaged) centers and build relationships
    let clusterIndex = 0
    const multiDomainEdges = new Set<string>()

    clusters.forEach(([domain, deities]) => {
        const clusterCenter = clusterPositions[clusterIndex]!

        if (clusterCenter) {
            deities.forEach((star) => {
                const domains = parseDomains(star.domains)
                const hasMultiple = domains.length > 1

                // If multiple domains, place near the average of their clusters
                let targetCenter = clusterCenter
                if (hasMultiple) {
                    const centers: { x: number; y: number; z: number }[] = []
                    domains.forEach((d) => {
                        const idx = clusters.findIndex(([dd]) => dd === d)
                        if (idx !== -1 && clusterPositions[idx]) {
                            centers.push(clusterPositions[idx]!)
                        }
                    })
                    if (centers.length > 0) {
                        const avg = centers.reduce((acc, c) => ({
                            x: acc.x + c.x,
                            y: acc.y + c.y,
                            z: acc.z + c.z,
                        }), { x: 0, y: 0, z: 0 })
                        targetCenter = {
                            x: avg.x / centers.length,
                            y: avg.y / centers.length,
                            z: avg.z / centers.length,
                        }
                    }

                    // Record edges between all domain pairs this star spans
                    for (let i = 0; i < domains.length; i++) {
                        for (let j = i + 1; j < domains.length; j++) {
                            const di = domains[i]
                            const dj = domains[j]
                            if (di && dj) {
                                multiDomainEdges.add(domainPairKey(di, dj))
                            }
                        }
                    }
                }

                const minDist = CLUSTER_OFFSET_MIN
                const maxDist = CLUSTER_OFFSET_MIN + CLUSTER_OFFSET_EXTRA
                const offset = randomOffsetInShell(minDist, maxDist)

                result.push({
                    ...star,
                    position: {
                        x: targetCenter.x + offset.x,
                        y: targetCenter.y + offset.y,
                        z: targetCenter.z + offset.z,
                    },
                    domainCluster: domain,
                } as StarData & { domainCluster: string })
            })
        }

        clusterIndex++
    })

    // Build relationships between deities in the same domain
    result.forEach((star, starIndex) => {
        result.forEach((otherStar, otherIndex) => {
            if (
                starIndex !== otherIndex &&
                (star as any).domainCluster === (otherStar as any).domainCluster &&
                !star.relations.includes(otherStar.id)
            ) {
                star.relations.push(otherStar.id)
            }
        })
    })

    // Build inter-domain links for multi-domain relationships (one link per domain pair)
    const domainToRepresentative = new Map<string, number>()
    // pick first star per domain as representative
    result.forEach((star) => {
        const d = (star as any).domainCluster as string
        if (d && !domainToRepresentative.has(d)) {
            domainToRepresentative.set(d, star.id)
        }
    })

    multiDomainEdges.forEach((pair) => {
        const [a, b] = pair.split('::')
        if (!a || !b) return
        const idA = domainToRepresentative.get(a)
        const idB = domainToRepresentative.get(b)
        if (!idA || !idB || idA === idB) return
        const starA = result.find((s) => s.id === idA)
        const starB = result.find((s) => s.id === idB)
        if (starA && starB) {
            if (!starA.relations.includes(idB)) starA.relations.push(idB)
            if (!starB.relations.includes(idA)) starB.relations.push(idA)
        }
    })

    return result
}


/**
 * Build relationships between mythology figures based on SPARQL results
 * (Requires additional query to fetch relationships)
 */
export function buildRelationships(
    starDataArray: StarData[],
    relationshipResults: any[]
): StarData[] {
    const nameToIdMap = new Map(starDataArray.map((s) => [s.name, s.id]))

    relationshipResults.forEach((relation) => {
        const subject = relation.subjectLabel?.value
        const object = relation.objectLabel?.value

        const subjectId = nameToIdMap.get(subject)
        const objectId = nameToIdMap.get(object)

        if (subjectId && objectId && subjectId !== objectId) {
            const starData = starDataArray.find((s) => s.id === subjectId)
            if (starData && !starData.relations.includes(objectId)) {
                starData.relations.push(objectId)
            }
        }
    })

    return starDataArray
}

/**
 * Example: Convert Greek gods from SPARQL to StarData
 */
export function processGreekGodsFromSparql(sparqlResults: SparqlMythologyResult[]): StarData[] {
    return convertMultipleSparqlResults(sparqlResults, 'Greek', 1)
}

/**
 * Example: Convert Norse gods from SPARQL to StarData
 */
export function processNorseGodsFromSparql(sparqlResults: SparqlMythologyResult[]): StarData[] {
    return convertMultipleSparqlResults(sparqlResults, 'Norse', 100)
}

/**
 * Example: Convert Egyptian gods from SPARQL to StarData
 */
export function processEgyptianGodsFromSparql(sparqlResults: SparqlMythologyResult[]): StarData[] {
    return convertMultipleSparqlResults(sparqlResults, 'Egyptian', 200)
}

/**
 * Example: Convert Hindu gods from SPARQL to StarData
 */
export function processHinduGodsFromSparql(sparqlResults: SparqlMythologyResult[]): StarData[] {
    return convertMultipleSparqlResults(sparqlResults, 'Hindu', 300)
}

/**
 * Example: Convert Celtic gods from SPARQL to StarData
 */
export function processCelticGodsFromSparql(sparqlResults: SparqlMythologyResult[]): StarData[] {
    return convertMultipleSparqlResults(sparqlResults, 'Celtic', 400)
}

/**
 * Merge multiple StarData arrays (from different mythologies)
 */
export function mergeStarDataArrays(...arrays: StarData[][]): StarData[] {
    return arrays.flat()
}

/**
 * Validate converted StarData
 */
export function validateStarData(data: StarData[]): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    data.forEach((item, index) => {
        if (!item.name || item.name.trim() === '') {
            errors.push(`Item at index ${index} has no name`)
        }
        if (!item.mythology || item.mythology.trim() === '') {
            errors.push(`Item at index ${index} has no mythology`)
        }
         {
            errors.push(`Item at index ${index} has invalid position`)
        }
    })

    return {
        valid: errors.length === 0,
        errors,
    }
}

function parseDomains(domainString: string | undefined): string[] {
    if (!domainString) return []
    return domainString
        .split(',')
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean)
}

function domainPairKey(a: string, b: string): string {
    return [a, b].sort().join('::')
}

// Increase minimum/maximum distance between cluster centers for clearer separation
const MIN_CLUSTER_DISTANCE = 10
const MAX_CLUSTER_DISTANCE = 20

function distance3D(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

function randomClusterPosition(): { x: number; y: number; z: number } {
  const distance = MIN_CLUSTER_DISTANCE + Math.random() * (MAX_CLUSTER_DISTANCE - MIN_CLUSTER_DISTANCE)
  const theta = Math.random() * Math.PI * 2
  const phi = Math.random() * Math.PI
  return {
    x: distance * Math.sin(phi) * Math.cos(theta),
    y: (Math.random() - 0.5) * 10,
    z: distance * Math.sin(phi) * Math.sin(theta),
  }
}

function generateClusterPosition(existing: Array<{ x: number; y: number; z: number }>): { x: number; y: number; z: number } {
  const maxAttempts = 200
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = randomClusterPosition()
    const ok = existing.every((p) => distance3D(p, candidate) >= MIN_CLUSTER_DISTANCE)
    if (ok) return candidate
  }
  // Fallback: pick random and nudge away from closest
  const candidate = randomClusterPosition()
  if (existing.length === 0) return candidate
  let closest: { x: number; y: number; z: number } = existing[0]!
  let minDist = distance3D(candidate, closest)
  for (const p of existing) {
    const d = distance3D(candidate, p)
    if (d < minDist) {
      minDist = d
      closest = p
    }
  }
  if (minDist === 0) minDist = 0.001
  const needed = MIN_CLUSTER_DISTANCE - minDist

  const dir = {
    x: (candidate.x - closest.x) / minDist,
    y: (candidate.y - closest.y) / minDist,
    z: (candidate.z - closest.z) / minDist,
  }
  return {
    x: candidate.x + dir.x * needed,
    y: candidate.y + dir.y * needed,
    z: candidate.z + dir.z * needed,
  }
}

// Tighten intra-cluster spread so stars stay closer to their domain center
const CLUSTER_OFFSET_MIN = 1.0
const CLUSTER_OFFSET_EXTRA = 1.5

function randomUnitVector3(): { x: number; y: number; z: number } {
  // Uniform on sphere using Marsaglia method
  let x = 0, y = 0, z, s = 2
  while (s >= 1 || s === 0) {
    x = Math.random() * 2 - 1
    y = Math.random() * 2 - 1
    s = x * x + y * y
  }
  const factor = Math.sqrt(1 - s)
  z = 2 * s - 1
  return { x: 2 * x * factor, y: 2 * y * factor, z }
}

function randomOffsetInShell(minDist: number, maxDist: number): { x: number; y: number; z: number } {
  const v = randomUnitVector3()
  const r = minDist + Math.random() * (maxDist - minDist)
  return { x: v.x * r, y: v.y * r, z: v.z * r }
}
