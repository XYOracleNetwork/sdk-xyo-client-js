import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Collection } from 'mongodb'

import { XyoBoundWitnessJson } from '../models'

class MongoSdk<T> extends BaseMongoSdk<XyoBoundWitnessJson<T>> {
  public async insert(item: XyoBoundWitnessJson<T>) {
    return await this.useCollection(async (collection: Collection<XyoBoundWitnessJson<T>>) => {
      const result = await collection.insertOne(item)
      if (result.result.ok) {
        return result.insertedId
      } else {
        throw Error('Insert Failed')
      }
    })
  }
}

export default MongoSdk
