import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Collection } from 'mongodb'

import { WithXyoArchivistMeta, XyoBoundWitnessJson } from '../models'

class MongoSdk<T> extends BaseMongoSdk<WithXyoArchivistMeta<XyoBoundWitnessJson<T>>> {
  private _archive: string
  constructor(config: BaseMongoSdkConfig, archive: string) {
    super(config)
    this._archive = archive
  }

  public async insert(item: WithXyoArchivistMeta<XyoBoundWitnessJson<T>>) {
    return await this.useCollection(async (collection: Collection<WithXyoArchivistMeta<XyoBoundWitnessJson<T>>>) => {
      const result = await collection.insertOne(item)
      if (result.result.ok) {
        return result.insertedId
      } else {
        throw Error('Insert Failed')
      }
    })
  }

  public async insertMany(items: XyoBoundWitnessJson<T>[]) {
    return await this.useCollection(async (collection: Collection<WithXyoArchivistMeta<XyoBoundWitnessJson<T>>>) => {
      const result = await collection.insertMany(items)
      if (result.result.ok) {
        return result.insertedIds
      } else {
        throw Error('Insert Failed')
      }
    })
  }
}

export default MongoSdk
