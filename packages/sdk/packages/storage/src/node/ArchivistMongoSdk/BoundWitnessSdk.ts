import { assertEx } from '@xylabs/assert'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Collection, ExplainVerbosity } from 'mongodb'

import { XyoBoundWitnessWithPartialMeta } from './Meta'

export class XyoArchivistBoundWitnessMongoSdk extends BaseMongoSdk<XyoBoundWitnessWithPartialMeta> {
  private _archive: string
  private _maxTime: number
  constructor(config: BaseMongoSdkConfig, archive: string, maxTime = 2000) {
    super(config)
    this._archive = archive
    this._maxTime = maxTime
  }

  async deleteByHash(hash: string) {
    return await this.useCollection(async (collection: Collection<XyoBoundWitnessWithPartialMeta>) => {
      return await collection.deleteMany({ _archive: this._archive, _hash: hash })
    })
  }

  async fetchCount() {
    return await this.useCollection(async (collection: Collection<XyoBoundWitnessWithPartialMeta>) => {
      return await collection.estimatedDocumentCount()
    })
  }

  async findAfter(timestamp: number, limit = 20) {
    return (await this.findAfterQuery(timestamp, limit)).toArray()
  }

  async findAfterPlan(timestamp: number, limit = 20) {
    return (await this.findAfterQuery(timestamp, limit)).explain(ExplainVerbosity.allPlansExecution)
  }

  async findBefore(timestamp: number, limit = 20) {
    return (await this.findBeforeQuery(timestamp, limit)).toArray()
  }

  async findBeforePlan(timestamp: number, limit = 20) {
    return (await this.findBeforeQuery(timestamp, limit)).explain(ExplainVerbosity.allPlansExecution)
  }

  async findByHash(hash: string, timestamp?: number) {
    return (await this.findByHashQuery(hash, timestamp)).toArray()
  }

  async findByHashPlan(hash: string, timestamp?: number) {
    return (await this.findByHashQuery(hash, timestamp)).explain(ExplainVerbosity.allPlansExecution)
  }

  async findRecent(limit = 20) {
    return (await this.findRecentQuery(limit)).toArray()
  }

  async findRecentPlan(limit = 20) {
    return (await this.findRecentQuery(limit)).explain(ExplainVerbosity.allPlansExecution)
  }

  async insert(item: XyoBoundWitnessWithPartialMeta) {
    const _timestamp = Date.now()
    const wrapper = new BoundWitnessWrapper(item)
    return await super.insertOne({
      ...item,
      _archive: this._archive,
      _hash: wrapper.hash,
      _timestamp,
    })
  }

  override async insertMany(items: XyoBoundWitnessWithPartialMeta[]) {
    const _timestamp = Date.now()
    const itemsToInsert = items.map((item) => {
      const wrapper = new BoundWitnessWrapper(item)
      return {
        ...item,
        _archive: this._archive,
        _hash: wrapper.hash,
        _timestamp,
      }
    })
    return await super.insertMany(itemsToInsert)
  }

  async updateByHash(hash: string, bw: XyoBoundWitnessWithPartialMeta) {
    return await this.useCollection(async (collection: Collection<XyoBoundWitnessWithPartialMeta>) => {
      return await collection.updateMany({ _archive: this._archive, _hash: hash }, bw)
    })
  }

  private async findAfterQuery(timestamp: number, limit: number) {
    assertEx(limit <= 100, `limit must be <= 100 [${limit}]`)
    return await this.useCollection((collection: Collection<XyoBoundWitnessWithPartialMeta>) => {
      return collection
        .find({ _archive: this._archive, _timestamp: { $gt: timestamp } })
        .sort({ _timestamp: 1 })
        .limit(limit)
        .maxTimeMS(this._maxTime)
    })
  }

  private async findBeforeQuery(timestamp: number, limit: number) {
    assertEx(limit <= 100, `limit must be <= 100 [${limit}]`)
    return await this.useCollection((collection: Collection<XyoBoundWitnessWithPartialMeta>) => {
      return collection
        .find({ _archive: this._archive, _timestamp: { $lt: timestamp } })
        .sort({ _timestamp: -1 })
        .limit(limit)
        .maxTimeMS(this._maxTime)
    })
  }

  private async findByHashQuery(hash: string, timestamp?: number) {
    const predicate = timestamp ? { _archive: this._archive, _hash: hash, _timestamp: timestamp } : { _archive: this._archive, _hash: hash }
    return await this.useCollection(async (collection: Collection<XyoBoundWitnessWithPartialMeta>) => {
      return await collection.find(predicate).maxTimeMS(this._maxTime)
    })
  }

  private async findRecentQuery(limit: number) {
    assertEx(limit <= 100, `limit must be <= 100 [${limit}]`)
    return await this.useCollection((collection: Collection<XyoBoundWitnessWithPartialMeta>) => {
      return collection.find({ _archive: this._archive }).sort({ _timestamp: -1 }).limit(limit).maxTimeMS(this._maxTime)
    })
  }
}
