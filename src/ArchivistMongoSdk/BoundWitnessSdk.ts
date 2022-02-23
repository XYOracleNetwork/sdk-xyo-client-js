import { assertEx } from '@xylabs/sdk-js'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Collection, ExplainVerbosity } from 'mongodb'

import { XyoBoundWitnessWrapper } from '../BoundWitness'
import { XyoBoundWitness } from '../models'

export class XyoArchivistBoundWitnessMongoSdk extends BaseMongoSdk<XyoBoundWitness> {
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

  private async findRecentQuery(limit: number) {
    assertEx(limit <= 100, `limit must be <= 100 [${limit}]`)
    return await this.useCollection((collection: Collection<XyoBoundWitness>) => {
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
    return await this.useCollection((collection: Collection<XyoBoundWitness>) => {
      return collection
        .find({ _archive: this._archive, _timestamp: { $gt: timestamp } })
        .sort({ _timestamp: -1 })
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
    return await this.useCollection((collection: Collection<XyoBoundWitness>) => {
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
    return await this.useCollection(async (collection: Collection<XyoBoundWitness>) => {
      return await collection.find(predicate).maxTimeMS(this._maxTime)
    })
  }

  public async findByHash(hash: string, timestamp?: number) {
    return (await this.findByHashQuery(hash, timestamp)).toArray()
  }

  public async findByHashPlan(hash: string, timestamp?: number) {
    return (await this.findByHashQuery(hash, timestamp)).explain(ExplainVerbosity.allPlansExecution)
  }

  public async findAfterHash(hash: string, limit = 20, timestamp?: number) {
    if (timestamp) return await this.findAfter(timestamp, limit)
    const blocks = await this.findByHash(hash)
    if (!blocks) return null
    // If there's multiple occurrences, take the last to prevent
    // never fully iterating the chain
    const block = blocks.pop()
    const blockTimestamp = block?._timestamp || 0
    assertEx(blockTimestamp, 'Block is missing a timestamp')
    return await this.findAfter(blockTimestamp, limit)
  }

  public async findBeforeHash(hash: string, limit = 20, timestamp?: number) {
    if (timestamp) return await this.findBefore(timestamp, limit)
    const blocks = await this.findByHash(hash)
    if (!blocks) return null
    // If there's multiple occurrences, take the first to prevent
    // never fully iterating the chain
    const block = blocks.shift()
    const blockTimestamp = block?._timestamp || 0
    assertEx(blockTimestamp, 'Block is missing a timestamp')
    return await this.findAfter(blockTimestamp, limit)
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
    return await super.insertOne({
      ...item,
      _archive: this._archive,
      _hash: wrapper.sortedHash(),
      _timestamp,
    })
  }

  public override async insertMany(items: XyoBoundWitness[]) {
    const _timestamp = Date.now()
    const itemsToInsert = items.map((item) => {
      const wrapper = new XyoBoundWitnessWrapper(item)
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
