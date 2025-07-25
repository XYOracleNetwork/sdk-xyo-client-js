import { assertEx } from '@xylabs/assert'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xylabs/mongo'
import { staticImplements } from '@xylabs/static-implements'
import { isDefined } from '@xylabs/typeof'
import {
  MongoDBModuleParamsV2, MongoDBModuleStatic, MongoDBModuleV2, MongoDBStorageClassLabels,
} from '@xyo-network/module-model-mongodb'
import { PayloadWithMongoMeta } from '@xyo-network/payload-mongodb'
import { Db, MongoServerError } from 'mongodb'

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
      const defaultConfig = { collection: COLLECTIONS.Payloads }
      // If the params of config have payloadSdkConfig, merge it with the default config
      const paramsPayloadSdkConfig = this.params.payloadSdkConfig
      const configPayloadSdkConfig = this.config.payloadSdkConfig
      if (isDefined(paramsPayloadSdkConfig) || isDefined(configPayloadSdkConfig)) {
        return merge(
          defaultConfig,
          configPayloadSdkConfig ?? {},
          paramsPayloadSdkConfig ?? {},
        )
      } else {
        // Otherwise, attempt to get the config from the environment
        // TODO: Deprecate this in favor of params/config injection
        // This is a temporary solution to maintain backward compatibility
        // and should be removed in the future.
        const envConfig = getBaseMongoSdkPrivateConfig()
        return merge(
          defaultConfig,
          envConfig,
        )
      }
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

      if (isDefined(max)) {
        // Create capped collection if it doesn't exist or convert it if it does
        await ensureCappedCollection(this.payloads, max)
        // Recreate indexes after creating/converting a capped collection as
        // capped will remove all indexes on existing collections.
        // https://www.mongodb.com/docs/manual/reference/command/convertToCapped/
        await ensureIndexesExistOnCollection(this.payloads, [...payloadStandardIndexes])
      } else {
      // Create indexes (creates collection without having to write data to it)
        await ensureIndexesExistOnCollection(this.payloads, [...payloadStandardIndexes])
      }
    }
  }
  return MongoModuleBase
}

const collectionExists = async (db: Db, name: string): Promise<boolean> => {
  const collections = await db.listCollections({ name }).toArray()
  return collections.length > 0
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
const ensureCappedCollection = async (sdk: BaseMongoSdk<PayloadWithMongoMeta>, max: number, docSize = 1024) => {
  await sdk.useCollection(async (collection) => {
    const name = collection.collectionName.toLowerCase()
    await sdk.useMongo(async (client) => {
      const db = client.db(collection.dbName)
      const exists = await collectionExists(db, name)
      const size = docSize * max
      return exists
        ? await ensureExistingCollectionIsCapped(sdk, max, size)
        // Create capped collection
        : await db.createCollection(name, {
            capped: true, size, max,
          })
    })
  })
}

/**
 * Converts an existing collection to a capped collection with a max document count.
 * Since MongoDB doesn't support `max` in `convertToCapped` or `cloneCollectionAsCapped`,
 * this function recreates the collection to work around Mongo's limitations.
 * https://www.mongodb.com/docs/manual/reference/command/convertToCapped/
 * https://www.mongodb.com/docs/manual/reference/command/clonecollectionascapped/
 * @param db - The MongoDB database instance
 * @param name - The name of the collection to convert
 * @param max - The maximum number of documents to retain
 * @param docSize - Fallback size (in bytes) to use if no documents exist (default 1KB)
 */
const ensureExistingCollectionIsCapped = async (
  sdk: BaseMongoSdk<PayloadWithMongoMeta>,
  max: number,
  docSize = 1024,
): Promise<void> => {
  await sdk.useCollection(async (collection) => {
    const name = collection.collectionName.toLowerCase()
    await sdk.useMongo(async (client) => {
      const db = client.db(collection.dbName)
      const exists = await collectionExists(db, name)
      if (!exists) throw new Error(`Collection '${name}' does not exist`)

      const size = docSize * max

      const stats = await db.command({ collStats: name })
      if (stats.capped && stats.max === max && stats.maxSize === size) {
        return
      }

      const tmpName = `${name}_tmp_capped`

      // Create new capped collection
      await db.createCollection(tmpName, {
        capped: true, size, max,
      })

      // Copy most recent documents
      const docs = await collection
        .find()
        .sort({ $natural: -1 })
        .limit(max)
        .toArray()

      if (docs.length > 0) await db.collection(tmpName).insertMany(docs.toReversed())

      // Replace old collection
      await collection.drop()
      await db.collection(tmpName).rename(name)
    })
  })
}
