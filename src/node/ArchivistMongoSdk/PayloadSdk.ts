import { assertEx } from '@xylabs/sdk-js'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Collection, ExplainVerbosity } from 'mongodb'

import { XyoPayload, XyoPayloadWrapper } from '../../core'

export class XyoArchivistPayloadMongoSdk extends BaseMongoSdk<XyoPayload> {
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

  public async findRecentQuery(limit: number) {
    assertEx(limit <= 100, `limit must be <= 100 [${limit}]`)
    return await this.useCollection((collection: Collection<XyoPayload>) => {
      return collection.find({ _archive: this._archive }).sort({ _timestamp: -1 }).limit(limit).maxTimeMS(this._maxTime)
    })
  }

  public async findRecent(limit = 20) {
    return (await this.findRecentQuery(limit)).toArray()
  }

  public async findRecentPlan(limit = 20) {
    return (await this.findRecentQuery(limit)).explain(ExplainVerbosity.allPlansExecution)
  }

  private async findAfterQuery(timestamp: number, limit: number) {
    assertEx(limit <= 100, `limit must be <= 100 [${limit}]`)
    return await this.useCollection((collection: Collection<XyoPayload>) => {
      return collection
        .find({ _archive: this._archive, _timestamp: { $gt: timestamp } })
        .sort({ _timestamp: 1 })
        .limit(limit)
        .maxTimeMS(this._maxTime)
    })
  }

  public async findAfter(timestamp: number, limit = 20) {
    return (await this.findAfterQuery(timestamp, limit)).toArray()
  }

  public async findAfterPlan(timestamp: number, limit = 20) {
    return (await this.findAfterQuery(timestamp, limit)).explain(ExplainVerbosity.allPlansExecution)
  }

  private async findBeforeQuery(timestamp: number, limit: number) {
    assertEx(limit <= 100, `limit must be <= 100 [${limit}]`)
    return await this.useCollection((collection: Collection<XyoPayload>) => {
      return collection
        .find({ _archive: this._archive, _timestamp: { $lt: timestamp } })
        .sort({ _timestamp: -1 })
        .limit(limit)
        .maxTimeMS(this._maxTime)
    })
  }

  public async findBefore(timestamp: number, limit = 20) {
    return (await this.findBeforeQuery(timestamp, limit)).toArray()
  }

  public async findBeforePlan(timestamp: number, limit = 20) {
    return (await this.findBeforeQuery(timestamp, limit)).explain(ExplainVerbosity.allPlansExecution)
  }

  private async findByHashQuery(hash: string, timestamp?: number) {
    const predicate = timestamp
      ? { _archive: this._archive, _hash: hash, _timestamp: timestamp }
      : { _archive: this._archive, _hash: hash }
    return await this.useCollection(async (collection: Collection<XyoPayload>) => {
      return await collection.find(predicate).maxTimeMS(this._maxTime)
    })
  }

  public async findByHash(hash: string, timestamp?: number) {
    return (await this.findByHashQuery(hash, timestamp)).toArray()
  }

  public async findByHashPlan(hash: string, timestamp?: number) {
    return (await this.findByHashQuery(hash, timestamp)).explain(ExplainVerbosity.allPlansExecution)
  }

  public async updateByHash(hash: string, payload: XyoPayload) {
    return await this.useCollection(async (collection: Collection<XyoPayload>) => {
      return await collection.updateMany({ _archive: this._archive, _hash: hash }, { $set: payload })
    })
  }

  public async deleteByHash(hash: string) {
    return await this.useCollection(async (collection: Collection<XyoPayload>) => {
      return await collection.deleteMany({ _archive: this._archive, _hash: hash })
    })
  }

  public async findByHashes(hashes: string[]) {
    return await this.useCollection(async (collection: Collection<XyoPayload>) => {
      const promises = hashes.map((hash) => {
        return collection.find({ _archive: this._archive, _hash: hash }).maxTimeMS(this._maxTime).toArray()
      })
      const results = await Promise.allSettled(promises)
      const finalResult: XyoPayload[] = []
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          finalResult.push(...result.value)
        }
      })
      return finalResult
    })
  }

  public async insert(item: XyoPayload) {
    const _timestamp = Date.now()
    const wrapper = new XyoPayloadWrapper(item)
    return await super.insertOne({
      ...item,
      _archive: this._archive,
      _hash: wrapper.sortedHash(),
      _timestamp,
    })
  }

  public override async insertMany(items: XyoPayload[]) {
    const _timestamp = Date.now()
    const itemsToInsert = items.map((item) => {
      const wrapper = new XyoPayloadWrapper(item)
      return {
        ...item,
        _archive: this._archive,
        _hash: wrapper.sortedHash(),
        _timestamp,
      }
    })
    return await super.insertMany(itemsToInsert)
  }
}
