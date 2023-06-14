import { PreviousHashStore } from '@xyo-network/previous-hash-store-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { AddressInfo } from '../Mongo'

export class MongoDBPreviousHashStore implements PreviousHashStore {
  keyPrefix?: string

  constructor(protected readonly addressInfoSdk: BaseMongoSdk<AddressInfo>) {}

  async getItem(key: string): Promise<string | null> {
    const address = this.getKeyName(key)
    const value = await this.addressInfoSdk.findOne({ address })
    return value?.previousHash ?? null
  }
  async removeItem(key: string): Promise<void> {
    const address = this.getKeyName(key)
    await this.addressInfoSdk.deleteOne({ address })
  }
  async setItem(key: string, previousHash: string): Promise<void> {
    const address = this.getKeyName(key)
    await this.addressInfoSdk.upsertOne({ address }, { $set: { previousHash } })
  }
  protected getKeyName(key: string) {
    return this.keyPrefix ? `${this.keyPrefix}${key}` : key
  }
}
