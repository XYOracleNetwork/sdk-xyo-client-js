import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Collection, Document as MongoDocument } from 'mongodb'

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
