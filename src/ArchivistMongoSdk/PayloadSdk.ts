import { assertEx } from '@xyo-network/sdk-xyo-js'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Collection } from 'mongodb'

import { XyoPayload } from '../models'
import { XyoPayloadWrapper } from '../Payload'

class PayloadSdk extends BaseMongoSdk<XyoPayload> {
  private _archive: string
  private _maxTime: number
  constructor(config: BaseMongoSdkConfig, archive: string, maxTime = 2000) {
    super(config)
    this._archive = archive
    this._maxTime = maxTime
  }

  public async fetchCount() {
    return await this.useCollection(async (collection: Collection<XyoPayload>) => {
      return await collection.estimatedDocumentCount()
    })
  }

  public async insert(item: XyoPayload) {
    const _timestamp = Date.now()
    const wrapper = new XyoPayloadWrapper(item)
    return await this.useCollection(async (collection: Collection<XyoPayload>) => {
      const result = await collection.insertOne({
        ...item,
        _archive: this._archive,
        _hash: wrapper.sortedHash(),
        _timestamp,
      })
      if (result.acknowledged) {
        return result.insertedId
      } else {
        throw new Error('Insert Failed')
      }
    })
  }

  public async findByHash(hash: string) {
    return await this.useCollection(async (collection: Collection<XyoPayload>) => {
      return await collection.find({ _archive: this._archive, _hash: hash }).maxTimeMS(this._maxTime).toArray()
    })
  }

  public async findRecentQuery(limit: number) {
    assertEx(limit <= 100, `limit must be <= 100 [${limit}]`)
    return await this.useCollection((collection: Collection<XyoPayload>) => {
      return collection
        .find({ _archive: this._archive })
        .sort({ _archive: -1, _timestamp: -1 })
        .limit(limit)
        .maxTimeMS(this._maxTime)
    })
  }

  public async findRecent(limit = 20) {
    return (await this.findRecentQuery(limit)).toArray()
  }

  public async findRecentPlan(limit = 20) {
    return (await this.findRecentQuery(limit)).explain()
  }

  public async insertMany(items: XyoPayload[]) {
    const _timestamp = Date.now()
    return await this.useCollection(async (collection: Collection<XyoPayload>) => {
      const result = await collection.insertMany(
        items.map((item) => {
          const wrapper = new XyoPayloadWrapper(item)
          return { ...item, _hash: wrapper.sortedHash(), _timestamp }
        })
      )
      if (result.acknowledged) {
        return result.insertedCount
      } else {
        throw new Error('Insert Failed')
      }
    })
  }
}

export default PayloadSdk
