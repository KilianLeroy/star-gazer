import { promises as fs } from 'fs'
import { join } from 'path'
import type { Webmention } from '../utils/webmention'

const webmentionsFilePath = join(process.cwd(), 'public', 'data', 'webmentions.json')

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
      webmentions = webmentions.filter(wm => wm.target === target)
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

