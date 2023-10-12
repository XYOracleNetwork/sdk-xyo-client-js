import { assertEx } from '@xylabs/assert'
import { DATABASES, getMongoDBConfig } from '@xyo-network/module-abstract-mongodb'
import { IndexDescription, MongoClient, WriteConcern } from 'mongodb'

import { AddressInfoIndexes } from './Specifications'

const indexesByCollection: Record<string, IndexDescription[]> = {
  // TODO: This collection can be removed once MongoDBPreviousHashStore
  // has a way of bootstrapping itself with indexes like our modules do
  address_info: AddressInfoIndexes,
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
export const addIndexes = async () => {
  // Create the required indexes
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
