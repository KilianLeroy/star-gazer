import { promises as fs } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { verifyWebmention, parseWebmentionSource, type Webmention } from '../utils/webmention'

const webmentionsFilePath = join(process.cwd(), 'public', 'data', 'webmentions.json')

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.source || !body.target) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Both source and target URLs are required'
    })
  }

  const { source, target } = body

  // Validate URLs
  try {
    new URL(source)
    new URL(target)
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid URL format'
    })
  }

  try {
    // Verify that the source actually links to the target
    const isValid = await verifyWebmention(source, target)

    if (!isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Source does not link to target'
      })
    }

    // Parse microformats from the source
    const parsedData = await parseWebmentionSource(source)

    // Create webmention entry
    const webmention: Webmention = {
      id: randomUUID(),
      source,
      target,
      timestamp: new Date().toISOString(),
      verified: true,
      type: parsedData.type || 'mention',
      author: parsedData.author,
      content: parsedData.content,
    }

    // Ensure directory exists
    const dir = join(process.cwd(), 'public', 'data')
    await fs.mkdir(dir, { recursive: true })

    // Read existing webmentions
    let webmentions: Webmention[]
    try {
      const fileContent = await fs.readFile(webmentionsFilePath, 'utf-8')
      webmentions = JSON.parse(fileContent)
    } catch (err) {
      webmentions = []
    }

    // Check for duplicates (same source and target)
    const existingIndex = webmentions.findIndex(
      wm => wm.source === source && wm.target === target
    )

    if (existingIndex >= 0) {
      // Update existing webmention
      webmentions[existingIndex] = webmention
    } else {
      // Add new webmention
      webmentions.push(webmention)
    }

    // Save to file
    await fs.writeFile(webmentionsFilePath, JSON.stringify(webmentions, null, 2))

    return {
      success: true,
      message: 'Webmention received and will be processed',
      webmention
    }
  } catch (error: any) {
    console.error('Error processing webmention:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process webmention'
    })
  }
})

