import { Db, IndexDescription } from 'mongodb'

import { COLLECTIONS } from '../../collections'

type ValueOf<T> = T[keyof T]

type Collection = ValueOf<typeof COLLECTIONS>

const indexesByCollection: Record<Collection, IndexDescription[]> = {
  archive_keys: [],
  archives: [],
  archivist_stats: [],
  bound_witnesses: [],
  payloads: [],
  users: [],
}

export const addIndexes = async (db: Db) => {
  for (const [collection, indexSpecs] of Object.entries(indexesByCollection)) {
    if (indexSpecs.length > 0) {
      await db.collection(collection).createIndexes(indexSpecs)
    }
  }
}
