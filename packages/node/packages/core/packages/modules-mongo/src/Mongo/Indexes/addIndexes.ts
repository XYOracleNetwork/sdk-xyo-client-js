import { Db, IndexDescription } from 'mongodb'

const indexes: Record<string, IndexDescription[]> = {}

export const addIndexes = async (db: Db) => {
  const collections = Object.keys(indexes)
  for (const collection of collections) {
    const indexSpecs = indexes.collection
    await db.collection(collection).createIndexes(indexSpecs)
  }
}
