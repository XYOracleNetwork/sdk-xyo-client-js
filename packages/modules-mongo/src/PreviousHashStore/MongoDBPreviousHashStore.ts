import { PreviousHashStore } from '@xyo-network/previous-hash-store-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { AddressInfo } from '../Mongo'

export class MongoDBPreviousHashStore implements PreviousHashStore {
  constructor(protected readonly addressInfoSdk: BaseMongoSdk<AddressInfo>) {}

  async getItem(address: string): Promise<string | null> {
    const value = await this.addressInfoSdk.findOne({ address })
    return value?.previousHash ?? null
  }
  async removeItem(address: string): Promise<void> {
    await this.addressInfoSdk.deleteOne({ address })
  }
  async setItem(address: string, previousHash: string): Promise<void> {
    await this.addressInfoSdk.upsertOne({ address }, { $set: { previousHash } })
  }
}
