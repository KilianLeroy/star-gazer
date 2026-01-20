import { promises as fs } from 'fs'
import { join } from 'path'

const cardsFilePath = join(process.cwd(), 'public', 'data', 'visitation-cards.json')

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.profile || typeof body.profile !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Profile URL is required'
    })
  }

  try {
    const dir = join(process.cwd(), 'public', 'data')
    try {
      await fs.mkdir(dir, { recursive: true })
    } catch (err) {
    }

    let cards: string[]
    try {
      const fileContent = await fs.readFile(cardsFilePath, 'utf-8')
      cards = JSON.parse(fileContent)
    } catch (err) {
      cards = []
    }

    if (!cards.includes(body.profile)) {
      cards.push(body.profile)
      await fs.writeFile(cardsFilePath, JSON.stringify(cards, null, 2))
    }

    return {
      success: true,
      message: 'Profile added successfully',
      totalCards: cards.length
    }
  } catch (error) {
    console.error('Error saving visitation card:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save visitation card'
    })
  }
})

