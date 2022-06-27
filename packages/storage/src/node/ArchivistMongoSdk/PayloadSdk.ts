import { assertEx } from '@xylabs/sdk-js'
import { XyoPayloadWithPartialMeta, XyoPayloadWrapper } from '@xyo-network/payload'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Collection, ExplainVerbosity, Filter, SortDirection } from 'mongodb'

export class XyoArchivistPayloadMongoSdk extends BaseMongoSdk<XyoPayloadWithPartialMeta> {
  private _archive: string
  private _maxTime: number
  constructor(config: BaseMongoSdkConfig, archive: string, maxTime = 2000) {
    super(config)
    this._archive = archive
    this._maxTime = maxTime
  }

  public async fetchCount() {
    return await this.useCollection(async (collection: Collection<XyoPayloadWithPartialMeta>) => {
      return await collection.estimatedDocumentCount()
    })
  }

  public async findRecentQuery(limit: number) {
    assertEx(limit <= 100, `limit must be <= 100 [${limit}]`)
    return await this.useCollection((collection: Collection<XyoPayloadWithPartialMeta>) => {
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
    return await this.useCollection((collection: Collection<XyoPayloadWithPartialMeta>) => {
      return collection
        .find({ _archive: this._archive, _timestamp: { $gt: timestamp } })
        .sort({ _timestamp: 1 })
        .limit(limit)
        .maxTimeMS(this._maxTime)
    })
  }

  private async findSortedQuery(timestamp: number, limit: number, order: 'asc' | 'desc', schema?: string) {
    assertEx(limit <= 100, `limit must be <= 100 [${limit}]`)
    const _queryTimestamp = order === 'desc' ? { $lt: timestamp } : { $gt: timestamp }
    const query: Filter<XyoPayloadWithPartialMeta> = { _archive: this._archive, _timestamp: _queryTimestamp }
    if (schema) {
      query.schema = schema
    }
    const sort: { [key: string]: SortDirection } = { _timestamp: order === 'asc' ? 1 : -1 }
    return await this.useCollection((collection: Collection<XyoPayloadWithPartialMeta>) => {
      return collection.find(query).sort(sort).limit(limit).maxTimeMS(this._maxTime)
    })
  }

  public async findSorted(timestamp: number, limit: number, order: 'asc' | 'desc', schema?: string) {
    return (await this.findSortedQuery(timestamp, limit, order, schema)).toArray()
  }

  public async findAfter(timestamp: number, limit = 20) {
    return (await this.findAfterQuery(timestamp, limit)).toArray()
  }

  public async findAfterPlan(timestamp: number, limit = 20) {
    return (await this.findAfterQuery(timestamp, limit)).explain(ExplainVerbosity.allPlansExecution)
  }

  private async findBeforeQuery(timestamp: number, limit: number) {
    assertEx(limit <= 100, `limit must be <= 100 [${limit}]`)
    return await this.useCollection((collection: Collection<XyoPayloadWithPartialMeta>) => {
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
    const predicate = timestamp ? { _archive: this._archive, _hash: hash, _timestamp: timestamp } : { _archive: this._archive, _hash: hash }
    return await this.useCollection(async (collection: Collection<XyoPayloadWithPartialMeta>) => {
      return await collection.find(predicate).maxTimeMS(this._maxTime)
    })
  }

  public async findByHash(hash: string, timestamp?: number) {
    return (await this.findByHashQuery(hash, timestamp)).toArray()
  }

  public async findByHashPlan(hash: string, timestamp?: number) {
    return (await this.findByHashQuery(hash, timestamp)).explain(ExplainVerbosity.allPlansExecution)
  }

  public async updateByHash(hash: string, payload: XyoPayloadWithPartialMeta) {
    return await this.useCollection(async (collection: Collection<XyoPayloadWithPartialMeta>) => {
      return await collection.updateMany({ _archive: this._archive, _hash: hash }, { $set: payload })
    })
  }

  public async deleteByHash(hash: string) {
    return await this.useCollection(async (collection: Collection<XyoPayloadWithPartialMeta>) => {
      return await collection.deleteMany({ _archive: this._archive, _hash: hash })
    })
  }

  public async findByHashes(hashes: string[]) {
    return await this.useCollection(async (collection: Collection<XyoPayloadWithPartialMeta>) => {
      const promises = hashes.map((hash) => {
        return collection.find({ _archive: this._archive, _hash: hash }).maxTimeMS(this._maxTime).toArray()
      })
      const results = await Promise.allSettled(promises)
      const finalResult: XyoPayloadWithPartialMeta[] = []
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          finalResult.push(...result.value)
        }
      })
      return finalResult
    })
  }

  public async insert(item: XyoPayloadWithPartialMeta) {
    const _timestamp = Date.now()
    const wrapper = new XyoPayloadWrapper(item)
    return await super.insertOne({
      ...item,
      _archive: this._archive,
      _hash: wrapper.hash,
      _timestamp,
    })
  }

  public override async insertMany(items: XyoPayloadWithPartialMeta[]) {
    const _timestamp = Date.now()
    const itemsToInsert = items.map((item) => {
      const wrapper = new XyoPayloadWrapper(item)
      return {
        ...item,
        _archive: this._archive,
        _hash: wrapper.hash,
        _timestamp,
      }
    })
    return await super.insertMany(itemsToInsert)
  }
}
