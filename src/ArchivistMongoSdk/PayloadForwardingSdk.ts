import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Collection, Document as MongoDocument } from 'mongodb'

class PayloadForwardingSdk extends BaseMongoSdk<MongoDocument> {
  constructor(config: BaseMongoSdkConfig) {
    super(config)
  }

  public async insert(item: MongoDocument) {
    const _timestamp = Date.now()
    return await this.useCollection(async (collection: Collection<MongoDocument>) => {
      const result = await collection.insertOne({ _timestamp, ...item })
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
          return { _timestamp, ...item }
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

export default PayloadForwardingSdk
