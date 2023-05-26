import { PreviousHashStore } from '@xyo-network/core'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

export type AddressPreviousHash = { address: string; previousHash: string }

export class MongoDBPreviousHashStore implements PreviousHashStore {
  keyPrefix?: string

  constructor(protected readonly payloadSdk: BaseMongoSdk<AddressPreviousHash>) {}

  async getItem(key: string): Promise<string | null | Promise<string | null>> {
    const address = this.getKeyName(key)
    const value = await this.payloadSdk.findOne({ address })
    return value?.previousHash ?? null
  }
  async removeItem(key: string): Promise<void | Promise<void>> {
    const address = this.getKeyName(key)
    await this.payloadSdk.useMongo((db) => db.db('foo').collection('bar').deleteOne({ address }))
  }
  async setItem(key: string, previousHash: string): Promise<void | Promise<void>> {
    const address = this.getKeyName(key)
    await this.payloadSdk.insertOne({ address, previousHash })
  }
  protected getKeyName(key: string) {
    return this.keyPrefix ? `${this.keyPrefix}${key}` : key
  }
}
