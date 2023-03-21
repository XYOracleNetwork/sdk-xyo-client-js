import { Db, IndexDescription } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { ArchivesIndexes, ArchivistStatsIndexes, BoundWitnessesIndexes, PayloadsIndexes } from './Specifications'

type ValueOf<T> = T[keyof T]

type Collection = ValueOf<typeof COLLECTIONS>

const indexesByCollection: Record<Collection, IndexDescription[]> = {
  archive_keys: [],
  archives: ArchivesIndexes,
  archivist_stats: ArchivistStatsIndexes,
  bound_witnesses: BoundWitnessesIndexes,
  payloads: PayloadsIndexes,
  users: [],
}

export const addIndexes = async (db: Db) => {
  for (const [collection, indexSpecs] of Object.entries(indexesByCollection)) {
    if (indexSpecs.length > 0) {
      await db.collection(collection).createIndexes(indexSpecs)
    }
  }
}
