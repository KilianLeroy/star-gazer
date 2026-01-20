import { promises as fs } from 'fs'
import { join } from 'path'

// File path to store visitor profiles
const cardsFilePath = join(process.cwd(), 'public', 'data', 'visitation-cards.json')

export default defineEventHandler(async () => {
  try {
    let cards: string[]
    try {
      const fileContent = await fs.readFile(cardsFilePath, 'utf-8')
      cards = JSON.parse(fileContent)
    } catch (err) {
      cards = []
    }

    return {
      success: true,
      cards: cards
    }
  } catch (error) {
    console.error('Error reading visitation cards:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to read visitation cards'
    })
  }
})

