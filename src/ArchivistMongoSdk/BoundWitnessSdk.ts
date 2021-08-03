import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Collection } from 'mongodb'

import { WithXyoArchivistMeta, XyoBoundWitnessJson } from '../models'

class BoundWitnessSdk extends BaseMongoSdk<WithXyoArchivistMeta<XyoBoundWitnessJson>> {
  private _archive: string
  constructor(config: BaseMongoSdkConfig, archive: string) {
    super(config)
    this._archive = archive
  }

  public async findByHash(hash: string) {
    return await this.useCollection(async (collection: Collection<WithXyoArchivistMeta<XyoBoundWitnessJson>>) => {
      return await collection.findOne({ _hash: hash })
    })
  }

  public async insert(item: WithXyoArchivistMeta<XyoBoundWitnessJson>) {
    const _timestamp = Date.now()
    return await this.useCollection(async (collection: Collection<WithXyoArchivistMeta<XyoBoundWitnessJson>>) => {
      const result = await collection.insertOne({ _archive: this._archive, _timestamp, ...item })
      if (result.acknowledged) {
        return result.insertedId
      } else {
        throw Error('Insert Failed')
      }
    })
  }

  public async insertMany(items: XyoBoundWitnessJson[]) {
    const _timestamp = Date.now()
    return await this.useCollection(async (collection: Collection<WithXyoArchivistMeta<XyoBoundWitnessJson>>) => {
      const result = await collection.insertMany(
        items.map((item) => {
          return { _archive: this._archive, _timestamp, ...item }
        })
      )
      if (result.acknowledged) {
        return result.insertedCount
      } else {
        throw Error('Insert Failed')
      }
    })
  }
}

export default BoundWitnessSdk
