import { assertEx } from '@xylabs/assert'
import { Db, IndexDescription, MongoClient, WriteConcern } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { DATABASES } from '../../databases'
import { getMongoDBConfig } from '../getMongoDBConfig'
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

const oneMinute = 60 * 1000

const getMongoClientForIndexCreation = () => {
  const env = getMongoDBConfig()
  const uri = assertEx(env.MONGO_CONNECTION_STRING)
  const client: MongoClient = new MongoClient(uri, {
    connectTimeoutMS: oneMinute,
    maxIdleTimeMS: oneMinute,
    serverSelectionTimeoutMS: oneMinute,
    socketTimeoutMS: oneMinute,
    waitQueueTimeoutMS: oneMinute,
    writeConcern: new WriteConcern(1),
  })
  return client
}

// TODO: Use injected client. However, we control
// timeout and relevant params for index creation
// with this client.
export const addIndexes = async (_db: Db) => {
  const client = getMongoClientForIndexCreation()
  try {
    for (const [collection, indexSpecs] of Object.entries(indexesByCollection)) {
      if (indexSpecs.length > 0) {
        try {
          await client.db(DATABASES.Archivist).collection(collection).createIndexes(indexSpecs)
        } catch (error) {
          console.log(error)
        }
      }
    }
  } finally {
    await client.close(true)
  }
}
