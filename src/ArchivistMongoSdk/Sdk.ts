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
      const result = await collection.insertOne({ _archive: this._archive, ...item })
      if (result.result.ok) {
        return result.insertedCount
      } else {
        throw Error('Insert Failed')
      }
    })
  }

  public async insertMany(items: XyoBoundWitnessJson<T>[]) {
    return await this.useCollection(async (collection: Collection<WithXyoArchivistMeta<XyoBoundWitnessJson<T>>>) => {
      const result = await collection.insertMany(
        items.map((item) => {
          return { _archive: this._archive, ...item }
        })
      )
      if (result.result.ok) {
        return result.insertedCount
      } else {
        throw Error('Insert Failed')
      }
    })
  }
}

export default MongoSdk
