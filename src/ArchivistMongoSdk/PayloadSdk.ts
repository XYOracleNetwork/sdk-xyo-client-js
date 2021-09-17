import { assertEx } from '@xyo-network/sdk-xyo-js'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Collection, Document as MongoDocument } from 'mongodb'

import { XyoPayload } from '..'
import { XyoPayloadWrapper } from '../Payload'

class PayloadSdk extends BaseMongoSdk<MongoDocument> {
  constructor(config: BaseMongoSdkConfig) {
    super(config)
  }

  public async insert(item: MongoDocument) {
    const _timestamp = Date.now()
    const wrapper = new XyoPayloadWrapper(item)
    return await this.useCollection(async (collection: Collection<MongoDocument>) => {
      const result = await collection.insertOne({ ...item, _hash: wrapper.sortedHash(), _timestamp })
      if (result.acknowledged) {
        return result.insertedId
      } else {
        throw new Error('Insert Failed')
      }
    })
  }

  public async findByHash(hash: string) {
    return await this.useCollection(async (collection: Collection<XyoPayload>) => {
      return await collection.find({ _hash: hash }).toArray()
    })
  }

  public async findRecent(limit = 20) {
    return await this.useCollection(async (collection: Collection<XyoPayload>) => {
      return await collection.find().sort({ _timestamp: -1 }).limit(limit).toArray()
    })
  }

  public async sample(size: number) {
    assertEx(size <= 10, `size must be <= 10 [${size}]`)
    return await this.useCollection(async (collection: Collection<XyoPayload>) => {
      return await collection.aggregate([{ $sample: { size } }]).toArray()
    })
  }

  public async insertMany(items: MongoDocument[]) {
    const _timestamp = Date.now()
    return await this.useCollection(async (collection: Collection<MongoDocument>) => {
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
