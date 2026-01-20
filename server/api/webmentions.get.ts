import { promises as fs } from 'fs'
import { join } from 'path'
import type { Webmention } from '../utils/webmention'

const webmentionsFilePath = join(process.cwd(), 'public', 'data', 'webmentions.json')

/**
 * Normalize a URL for comparison:
 * - Parse the URL
 * - Remove trailing slash from pathname if it's just "/"
 * - Return the normalized URL
 */
function normalizeUrl(urlString: string): string {
  try {
    const url = new URL(urlString)
    // Remove trailing slash only from root path
    if (url.pathname === '/') {
      url.pathname = ''
    } else if (url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1)
    }
    return url.toString().replace(/\/$/, '') // Remove trailing slash from full URL
  } catch (err) {
    return urlString
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const target = query.target as string | undefined

  try {
    let webmentions: Webmention[]

    try {
      const fileContent = await fs.readFile(webmentionsFilePath, 'utf-8')
      webmentions = JSON.parse(fileContent)
    } catch (err) {
      webmentions = []
    }

    if (target) {
      const normalizedTarget = normalizeUrl(target)
      webmentions = webmentions.filter(wm => normalizeUrl(wm.target) === normalizedTarget)
    }

    webmentions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return {
      success: true,
      webmentions,
      count: webmentions.length
    }
  } catch (error) {
    console.error('Error reading webmentions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to read webmentions'
    })
  }
})

