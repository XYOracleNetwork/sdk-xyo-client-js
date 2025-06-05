import { assertEx } from '@xylabs/assert'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xylabs/mongo'
import { staticImplements } from '@xylabs/static-implements'
import {
  MongoDBModuleParamsV2, MongoDBModuleStatic, MongoDBModuleV2, MongoDBStorageClassLabels,
} from '@xyo-network/module-model-mongodb'
import { PayloadWithMongoMeta } from '@xyo-network/payload-mongodb'
import { MongoServerError } from 'mongodb'

import { AnyAbstractModule } from './AnyAbstractModule.ts'
import { COLLECTIONS } from './Collections.ts'
import { getBaseMongoSdkPrivateConfig } from './config/index.ts'
import { IndexDescription } from './IndexDescription.ts'
import { merge } from './merge.ts'

const standardIndexes: IndexDescription[] = [
  {
    name: 'UX__hash', key: { _hash: 1 }, unique: true,
  },
  {
    name: 'IX__dataHash', key: { _dataHash: 1 }, unique: false,
  },
  {
    name: 'UX__sequence', key: { _sequence: 1 }, unique: true,
  },
]

export const MongoDBModuleMixinV2 = <
  TParams extends MongoDBModuleParamsV2 = MongoDBModuleParamsV2,
  TModule extends AnyAbstractModule<TParams> = AnyAbstractModule<TParams>,
>(
  ModuleBase: TModule,
) => {
  @staticImplements<MongoDBModuleStatic>()
  abstract class MongoModuleBase extends ModuleBase implements MongoDBModuleV2 {
    static readonly labels = MongoDBStorageClassLabels
    _payloadSdk: BaseMongoSdk<PayloadWithMongoMeta> | undefined

    get jobQueue() {
      return assertEx(this.params.jobQueue, () => 'MongoDBModule Error: jobQueue required for this module but is not defined')
    }

    get payloadSdkConfig(): BaseMongoSdkConfig {
      const config = { collection: COLLECTIONS.Payloads, ...getBaseMongoSdkPrivateConfig() }
      return merge(
        config,
        this.params.payloadSdkConfig,
        this.config.payloadSdkConfig,
        { collection: this.config.payloadSdkConfig?.collection ?? this.params.payloadSdkConfig?.collection ?? COLLECTIONS.Payloads },
      )
    }

    get payloads() {
      this._payloadSdk = this._payloadSdk ?? new BaseMongoSdk<PayloadWithMongoMeta>(this.payloadSdkConfig)
      return assertEx(this._payloadSdk)
    }

    /**
     * Ensures any indexes specified within the config are created. This method should be idempotent
     * allowing for multiple calls without causing errors while ensuring the desired state.
     */
    async ensureCollection(): Promise<void> {
      const { max } = this.config
      const payloadCollectionName = this.payloadSdkConfig.collection

      const payloadStandardIndexes = standardIndexes.map(ix => ({ ...ix, name: `${payloadCollectionName}.${ix.name}` }))
      // Create indexes (creates collection without having to write data to it)
      await ensureIndexesExistOnCollection(this.payloads, [...payloadStandardIndexes])
      if (max) {
        // Create capped collection if it doesn't exist or convert it if it does
        await ensureCappedCollection(this.payloads, max)
        // Recreate indexes after creating/converting a capped collection as
        // capped will remove all indexes
        // https://www.mongodb.com/docs/manual/reference/command/convertToCapped/
        await ensureIndexesExistOnCollection(this.payloads, [...payloadStandardIndexes])
      }
    }
  }
  return MongoModuleBase
}

/**
 * Ensures the specified indexes exist on the collection
 * @param sdk The sdk to use for the collection
 * @param configIndexes The indexes to ensure exist on the collection
 */
const ensureIndexesExistOnCollection = async (
  sdk: BaseMongoSdk<PayloadWithMongoMeta>,
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

/**
 * Ensures that a collection is capped with a max document count and a reasonable size.
 * If the collection exists and is not capped, it will be converted.
 * If it doesn't exist, it will be created.
 *
 * @param name The name of the collection.
 * @param count The maximum number of documents to retain.
 * @param documentSize Estimated average document size in bytes if collection is empty.
 */
const ensureCappedCollection = async (sdk: BaseMongoSdk<PayloadWithMongoMeta>, count: number, documentSize = 1024) => {
  await sdk.useCollection(async (collection) => {
    const collectionName = collection.collectionName.toLowerCase()
    await sdk.useMongo(async (client) => {
      const db = client.db(collection.dbName)
      const stats = await db.command({ collStats: collectionName })
      if (stats.capped) return
      const collectionSize = count * documentSize
      await db.command({
        convertToCapped: collectionName,
        count,
        size: collectionSize,
      })
    })
  })
}

/**
 * Converts an existing collection to a capped collection with a max document count.
 * Since MongoDB doesn't support `max` in `convertToCapped`, this function recreates the collection.
 *
 * @param db - The MongoDB database instance
 * @param name - The name of the collection to convert
 * @param maxDocs - The maximum number of documents to retain
 * @param fallbackDocSize - Fallback size (in bytes) to use if no documents exist (default 1KB)
 */
export async function convertExistingCollectionToCapped(
  sdk: BaseMongoSdk<PayloadWithMongoMeta>,
  maxDocs: number,
  fallbackDocSize = 1024,
): Promise<void> {
  await sdk.useCollection(async (collection) => {
    const name = collection.collectionName.toLowerCase()
    await sdk.useMongo(async (client) => {
      const db = client.db(collection.dbName)

      const tmpName = `${name}_tmp_capped`

      const exists = (await db.listCollections({ name }).toArray()).length > 0
      if (!exists) throw new Error(`Collection '${name}' does not exist`)

      const bsonSize = fallbackDocSize

      const cappedSize = bsonSize * maxDocs

      console.log(`Estimated doc size: ${bsonSize} bytes`)
      console.log(`Allocating capped collection size: ${cappedSize} bytes`)

      // Create capped collection
      await db.createCollection(tmpName, {
        capped: true,
        size: cappedSize,
        max: maxDocs,
      })

      // Copy most recent documents (up to max)
      const docs = await collection
        .find()
        .sort({ $natural: -1 })
        .limit(maxDocs)
        .toArray()

      if (docs.length > 0) await db.collection(tmpName).insertMany(docs.toReversed())

      // Drop old collection and rename
      await collection.drop()
      await db.collection(tmpName).rename(name)
    })
  })
}
