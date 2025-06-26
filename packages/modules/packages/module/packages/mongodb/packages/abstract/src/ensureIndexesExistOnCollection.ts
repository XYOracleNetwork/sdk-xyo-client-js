import type { BaseMongoSdk } from '@xylabs/mongo'
import type { BoundWitnessWithMongoMeta, PayloadWithMongoMeta } from '@xyo-network/payload-mongodb'
import type { MongoServerError } from 'mongodb'

import type { IndexDescription } from './IndexDescription.ts'

export const standardIndexes: IndexDescription[] = [
  {
    name: 'IX__hash', key: { _hash: 1 }, unique: false,
  },
  {
    name: 'IX__dataHash', key: { _dataHash: 1 }, unique: false,
  },
  {
    name: 'IX__sequence', key: { _sequence: 1 }, unique: false,
  },
]

/**
 * Ensures the specified indexes exist on the collection
 * @param sdk The sdk to use for the collection
 * @param configIndexes The indexes to ensure exist on the collection
 */
export const ensureIndexesExistOnCollection = async (
  sdk: BaseMongoSdk<PayloadWithMongoMeta> | BaseMongoSdk<BoundWitnessWithMongoMeta>,
  configIndexes: IndexDescription[],
) => {
  await sdk.useCollection(async (collection) => {
    const collectionName = collection.collectionName.toLowerCase()
    const indexes = configIndexes.filter(ix => ix?.name?.toLowerCase().startsWith(collectionName))
    if (indexes.length === 0) return
    for (const ix of indexes) {
      try {
        await collection.createIndexes([ix])
      } catch (error) {
        const mongoServerError = error as MongoServerError
        const { codeName } = mongoServerError
        if (codeName === 'IndexKeySpecsConflict' || codeName === 'IndexOptionsConflict') {
          // Index already exists which is fine OR index exists with another name which is fine
          // TODO: For the latter case (IndexOptionsConflict) we could get into this case
          // if we change the TTL an existing index.  We currently don't support TTLs so
          // we'll need to revisit this assumption if we do.
          continue
        }
        console.error(`Error creating index ${ix.name} for collection ${collectionName}: ${error}`)
        throw error
      }
    }
  })
}
