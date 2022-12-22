import { assertEx } from '@xylabs/assert'
import { XyoArchiveKey } from '@xyo-network/api'
import { ArchiveKeyRepository } from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Collection, WithId } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { getBaseMongoSdk } from '../../Mongo'

const fromDb = (k: WithId<XyoArchiveKey>) => {
  return {
    archive: k.archive,
    created: k._id.getTimestamp().getTime(),
    key: k.key,
  }
}

export class MongoDBArchiveKeyRepository implements ArchiveKeyRepository {
  constructor(protected readonly keys: BaseMongoSdk<XyoArchiveKey> = getBaseMongoSdk<XyoArchiveKey>(COLLECTIONS.ArchiveKeys)) {}
  get address(): string {
    throw new Error('Module query not implemented for MongoDBArchiveKeyRepository')
  }

  async find(filter: Partial<XyoArchiveKey>): Promise<XyoArchiveKey[]> {
    return (await (await this.keys.find(filter)).toArray()).map(fromDb)
  }
  async get(archive: string): Promise<XyoArchiveKey | undefined> {
    return (await (await this.keys.find({ archive })).toArray()).map(fromDb).pop()
  }
  async insert(item: XyoArchiveKey): Promise<XyoArchiveKey> {
    return await this.keys.useCollection(async (collection: Collection<XyoArchiveKey>) => {
      const result = await collection.insertOne({ ...item })
      if (result.acknowledged) {
        const key: XyoArchiveKey = {
          archive: item.archive,
          created: result.insertedId.getTimestamp().getTime(),
          key: item.key,
        }
        return key
      } else {
        throw new Error('Insert Failed')
      }
    })
  }
}
