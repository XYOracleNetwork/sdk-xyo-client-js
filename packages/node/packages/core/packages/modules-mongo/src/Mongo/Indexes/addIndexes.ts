import { Db, IndexDescription } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { Archives, ArchivistStats, BoundWitnesses, Payloads } from './Specifications'

type ValueOf<T> = T[keyof T]

type Collection = ValueOf<typeof COLLECTIONS>

const indexesByCollection: Record<Collection, IndexDescription[]> = {
  archive_keys: [],
  archives: Archives,
  archivist_stats: ArchivistStats,
  bound_witnesses: BoundWitnesses,
  payloads: Payloads,
  users: [],
}

export const addIndexes = async (db: Db) => {
  for (const [collection, indexSpecs] of Object.entries(indexesByCollection)) {
    if (indexSpecs.length > 0) {
      await db.collection(collection).createIndexes(indexSpecs)
    }
  }
}
