export interface StarData {
  id: number
  name: string
  mythology: string
  position: { x: number; y: number; z: number }
  relations: number[]
}

export const mythData: StarData[] = [
  // Greek Mythology
  { id: 1, name: 'Zeus', mythology: 'Greek', position: { x: 0, y: 5, z: 0 }, relations: [2, 3, 4] },
  { id: 2, name: 'Hera', mythology: 'Greek', position: { x: 2, y: 5, z: 1 }, relations: [1, 3] },
  { id: 3, name: 'Poseidon', mythology: 'Greek', position: { x: -3, y: 4, z: -2 }, relations: [1, 4] },
  { id: 4, name: 'Athena', mythology: 'Greek', position: { x: 3, y: 4, z: 2 }, relations: [1, 5] },
  { id: 5, name: 'Apollo', mythology: 'Greek', position: { x: 4, y: 3, z: 1 }, relations: [1, 4, 6] },
  { id: 6, name: 'Artemis', mythology: 'Greek', position: { x: 5, y: 3, z: 0 }, relations: [1, 5] },
  { id: 7, name: 'Ares', mythology: 'Greek', position: { x: -5, y: 2, z: 0 }, relations: [1, 2] },
  { id: 8, name: 'Aphrodite', mythology: 'Greek', position: { x: -4, y: 3, z: 1 }, relations: [1, 7] },
  { id: 9, name: 'Hephaestus', mythology: 'Greek', position: { x: -2, y: 2, z: -1 }, relations: [1, 8] },
  { id: 10, name: 'Hermes', mythology: 'Greek', position: { x: 1, y: 4, z: -1 }, relations: [1, 5] },
  { id: 11, name: 'Dionysus', mythology: 'Greek', position: { x: 2, y: 2, z: 2 }, relations: [1] },
  { id: 12, name: 'Demeter', mythology: 'Greek', position: { x: -1, y: 3, z: 3 }, relations: [1, 13] },
  { id: 13, name: 'Persephone', mythology: 'Greek', position: { x: -2, y: 1, z: 4 }, relations: [12, 14] },
  { id: 14, name: 'Hades', mythology: 'Greek', position: { x: -3, y: 0, z: 5 }, relations: [1, 13] },

  // Norse Mythology
  { id: 15, name: 'Odin', mythology: 'Norse', position: { x: 8, y: 5, z: -3 }, relations: [16, 17] },
  { id: 16, name: 'Thor', mythology: 'Norse', position: { x: 9, y: 4, z: -2 }, relations: [15, 17, 18] },
  { id: 17, name: 'Frigg', mythology: 'Norse', position: { x: 7, y: 5, z: -4 }, relations: [15] },
  { id: 18, name: 'Loki', mythology: 'Norse', position: { x: 10, y: 3, z: -1 }, relations: [15, 16, 19] },
  { id: 19, name: 'Freya', mythology: 'Norse', position: { x: 6, y: 4, z: -5 }, relations: [15, 20] },
  { id: 20, name: 'Freyr', mythology: 'Norse', position: { x: 5, y: 4, z: -6 }, relations: [19] },
  { id: 21, name: 'Baldur', mythology: 'Norse', position: { x: 8, y: 3, z: -3 }, relations: [15, 17] },
  { id: 22, name: 'Tyr', mythology: 'Norse', position: { x: 9, y: 2, z: -4 }, relations: [15] },
  { id: 23, name: 'Heimdall', mythology: 'Norse', position: { x: 7, y: 3, z: -2 }, relations: [15] },
  { id: 24, name: 'Hel', mythology: 'Norse', position: { x: 11, y: 0, z: -5 }, relations: [18] },

  // Egyptian Mythology
  { id: 25, name: 'Ra', mythology: 'Egyptian', position: { x: 0, y: 5, z: 8 }, relations: [26, 27] },
  { id: 26, name: 'Osiris', mythology: 'Egyptian', position: { x: -1, y: 4, z: 9 }, relations: [25, 27, 28] },
  { id: 27, name: 'Isis', mythology: 'Egyptian', position: { x: 1, y: 4, z: 9 }, relations: [25, 26, 28] },
  { id: 28, name: 'Horus', mythology: 'Egyptian', position: { x: 0, y: 3, z: 10 }, relations: [26, 27, 29] },
  { id: 29, name: 'Set', mythology: 'Egyptian', position: { x: -2, y: 3, z: 8 }, relations: [26, 28] },
  { id: 30, name: 'Anubis', mythology: 'Egyptian', position: { x: -1, y: 2, z: 11 }, relations: [26] },
  { id: 31, name: 'Thoth', mythology: 'Egyptian', position: { x: 2, y: 3, z: 8 }, relations: [25] },
  { id: 32, name: 'Bastet', mythology: 'Egyptian', position: { x: 1, y: 2, z: 7 }, relations: [25] },
  { id: 33, name: 'Sekhmet', mythology: 'Egyptian', position: { x: -2, y: 2, z: 10 }, relations: [25] },
  { id: 34, name: 'Hathor', mythology: 'Egyptian', position: { x: 2, y: 2, z: 9 }, relations: [25] },

  // Hindu Mythology
  { id: 35, name: 'Brahma', mythology: 'Hindu', position: { x: -8, y: 5, z: 5 }, relations: [36, 37] },
  { id: 36, name: 'Vishnu', mythology: 'Hindu', position: { x: -9, y: 5, z: 6 }, relations: [35, 37, 38] },
  { id: 37, name: 'Shiva', mythology: 'Hindu', position: { x: -7, y: 5, z: 4 }, relations: [35, 36, 39] },
  { id: 38, name: 'Lakshmi', mythology: 'Hindu', position: { x: -10, y: 4, z: 6 }, relations: [36] },
  { id: 39, name: 'Parvati', mythology: 'Hindu', position: { x: -6, y: 4, z: 4 }, relations: [37, 40] },
  { id: 40, name: 'Ganesha', mythology: 'Hindu', position: { x: -7, y: 3, z: 5 }, relations: [37, 39] },
  { id: 41, name: 'Hanuman', mythology: 'Hindu', position: { x: -9, y: 3, z: 7 }, relations: [36] },
  { id: 42, name: 'Durga', mythology: 'Hindu', position: { x: -6, y: 4, z: 3 }, relations: [37] },
  { id: 43, name: 'Kali', mythology: 'Hindu', position: { x: -5, y: 3, z: 5 }, relations: [37, 42] },
  { id: 44, name: 'Indra', mythology: 'Hindu', position: { x: -8, y: 4, z: 6 }, relations: [35] },

  // Celtic Mythology
  { id: 45, name: 'Dagda', mythology: 'Celtic', position: { x: 3, y: -4, z: -5 }, relations: [46, 47] },
  { id: 46, name: 'Morrigan', mythology: 'Celtic', position: { x: 4, y: -3, z: -6 }, relations: [45] },
  { id: 47, name: 'Brigid', mythology: 'Celtic', position: { x: 2, y: -3, z: -4 }, relations: [45] },
  { id: 48, name: 'Lugh', mythology: 'Celtic', position: { x: 3, y: -2, z: -5 }, relations: [45] },
  { id: 49, name: 'Cernunnos', mythology: 'Celtic', position: { x: 5, y: -4, z: -7 }, relations: [] },
  { id: 50, name: 'Danu', mythology: 'Celtic', position: { x: 1, y: -5, z: -3 }, relations: [45] },
]

