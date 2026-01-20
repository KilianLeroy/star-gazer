import { mf2 } from 'microformats-parser'

export interface Webmention {
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

/**
 * Verify that the source URL actually contains a link to the target URL
 */
export async function verifyWebmention(source: string, target: string): Promise<boolean> {
  try {
    const response = await fetch(source, {
      headers: {
        'User-Agent': 'Star-Gazer-Webmention/1.0',
      },
    })

    if (!response.ok) {
      return false
    }

    const html = await response.text()

    // Simple check: does the HTML contain the target URL?
    return html.includes(target)
  } catch (error) {
    console.error('Error verifying webmention:', error)
    return false
  }
}

/**
 * Parse microformats from the source page
 */
export async function parseWebmentionSource(source: string): Promise<Partial<Webmention>> {
  try {
    const response = await fetch(source, {
      headers: {
        'User-Agent': 'Star-Gazer-Webmention/1.0',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch source: ${response.status}`)
    }

    const html = await response.text()

    // Parse microformats
    const mfData = mf2(html, {
      baseUrl: source,
    })

    const result: Partial<Webmention> = {}

    // Try to find h-entry (blog post/article)
    const hEntry = mfData.items?.find((item: any) => item.type?.includes('h-entry'))

    if (hEntry) {
      // Determine type
      if (hEntry.properties?.['like-of']) {
        result.type = 'like'
      } else if (hEntry.properties?.['repost-of']) {
        result.type = 'repost'
      } else if (hEntry.properties?.['in-reply-to']) {
        result.type = 'reply'
      } else {
        result.type = 'mention'
      }

      // Extract author info
      const authorData = hEntry.properties?.author?.[0]
      if (authorData && typeof authorData === 'object' && 'properties' in authorData) {
        result.author = {
          name: (authorData as any).properties?.name?.[0] || 'Anonymous',
          photo: (authorData as any).properties?.photo?.[0],
          url: (authorData as any).properties?.url?.[0],
        }
      }

      // Extract content
      const contentData = hEntry.properties?.content?.[0]
      if (contentData) {
        if (typeof contentData === 'string') {
          result.content = { text: contentData }
        } else if (typeof contentData === 'object' && 'value' in contentData) {
          result.content = {
            text: (contentData as any).value,
            html: (contentData as any).html,
          }
        }
      }
    }

    return result
  } catch (error) {
    console.error('Error parsing webmention source:', error)
    return {}
  }
}



