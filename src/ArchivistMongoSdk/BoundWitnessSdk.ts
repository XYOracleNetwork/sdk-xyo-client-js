import { assertEx } from '@xylabs/sdk-js'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Collection } from 'mongodb'

import { XyoBoundWitnessWrapper } from '../BoundWitness'
import { XyoBoundWitness } from '../models'

class XyoArchivistBoundWitnessMongoSdk extends BaseMongoSdk<XyoBoundWitness> {
  private _archive: string
  private _maxTime: number
  constructor(config: BaseMongoSdkConfig, archive: string, maxTime = 2000) {
    super(config)
    this._archive = archive
    this._maxTime = maxTime
  }

  public async fetchCount() {
    return await this.useCollection(async (collection: Collection<XyoBoundWitness>) => {
      return await collection.estimatedDocumentCount()
    })
  }

  private async findRecentQuery(limit: number, client?: string) {
    assertEx(limit <= 100, `limit must be <= 100 [${limit}]`)
    return await this.useCollection((collection: Collection<XyoBoundWitness>) => {
      return collection
        .find(client ? { _archive: this._archive, _client: client } : { _archive: this._archive })
        .sort(client ? { _archive: -1, _client: -1, _timestamp: -1 } : { _archive: -1, _timestamp: -1 })
        .limit(limit)
        .maxTimeMS(this._maxTime)
    })
  }

  public async findRecent(limit = 20, client?: string) {
    return (await this.findRecentQuery(limit, client)).toArray()
  }

  public async findRecentPlan(limit = 20, client?: string) {
    return (await this.findRecentQuery(limit, client)).explain()
  }

  private async findAfterQuery(timestamp: number, limit: number, client?: string) {
    assertEx(limit <= 100, `limit must be <= 100 [${limit}]`)
    return await this.useCollection((collection: Collection<XyoBoundWitness>) => {
      return collection
        .find(
          client
            ? { _archive: this._archive, _client: client, _timestamp: { $gt: timestamp } }
            : { _archive: this._archive, _timestamp: { $gt: timestamp } }
        )
        .sort(client ? { _archive: -1, _client: -1, _timestamp: -1 } : { _archive: -1, _timestamp: -1 })
        .limit(limit)
        .maxTimeMS(this._maxTime)
    })
  }

  public async findAfter(timestamp: number, limit = 20, client?: string) {
    return (await this.findAfterQuery(timestamp, limit, client)).toArray()
  }

  public async findAfterPlan(timestamp: number, limit = 20, client?: string) {
    return (await this.findAfterQuery(timestamp, limit, client)).explain()
  }

  private async findBeforeQuery(timestamp: number, limit: number, client?: string) {
    assertEx(limit <= 100, `limit must be <= 100 [${limit}]`)
    return await this.useCollection((collection: Collection<XyoBoundWitness>) => {
      return collection
        .find(
          client
            ? { _archive: this._archive, _client: client, _timestamp: { $lt: timestamp } }
            : { _archive: this._archive, _timestamp: { $lt: timestamp } }
        )
        .sort(client ? { _archive: 1, _client: 1, _timestamp: 1 } : { _archive: 1, _timestamp: 1 })
        .limit(limit)
        .maxTimeMS(this._maxTime)
    })
  }

  public async findBefore(timestamp: number, limit = 20, client?: string) {
    return (await this.findBeforeQuery(timestamp, limit, client)).toArray()
  }

  public async findBeforePlan(timestamp: number, limit = 20, client?: string) {
    return (await this.findBeforeQuery(timestamp, limit, client)).explain()
  }

  public async findByHash(hash: string) {
    return await this.useCollection(async (collection: Collection<XyoBoundWitness>) => {
      return await collection.find({ _archive: this._archive, _hash: hash }).maxTimeMS(this._maxTime).toArray()
    })
  }

  public async updateByHash(hash: string, bw: XyoBoundWitness) {
    return await this.useCollection(async (collection: Collection<XyoBoundWitness>) => {
      return await collection.updateMany({ _archive: this._archive, _hash: hash }, { $set: bw })
    })
  }

  public async deleteByHash(hash: string) {
    return await this.useCollection(async (collection: Collection<XyoBoundWitness>) => {
      return await collection.deleteMany({ _archive: this._archive, _hash: hash })
    })
  }

  public async insert(item: XyoBoundWitness) {
    const _timestamp = Date.now()
    const wrapper = new XyoBoundWitnessWrapper(item)
    return await this.useCollection(async (collection: Collection<XyoBoundWitness>) => {
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

  public async insertMany(items: XyoBoundWitness[]) {
    const _timestamp = Date.now()
    return await this.useCollection(async (collection: Collection<XyoBoundWitness>) => {
      const result = await collection.insertMany(
        items.map((item) => {
          const wrapper = new XyoBoundWitnessWrapper(item)
          return {
            ...item,
            _archive: this._archive,
            _hash: wrapper.sortedHash(),
            _timestamp,
          }
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

export { XyoArchivistBoundWitnessMongoSdk }
