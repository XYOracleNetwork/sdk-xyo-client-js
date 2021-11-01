import { assertEx } from '@xyo-network/sdk-xyo-js'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Collection } from 'mongodb'

import { XyoBoundWitnessWrapper } from '../BoundWitness'
import { XyoBoundWitness } from '../models'

class BoundWitnessSdk extends BaseMongoSdk<XyoBoundWitness> {
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
      return collection
        .find({ _archive: this._archive })
        .sort({ _archive: -1, _timestamp: -1 })
        .limit(limit)
        .maxTimeMS(this._maxTime)
    })
  }

  public async findRecent(limit = 20) {
    return (await this.findRecentQuery(limit)).toArray()
  }

  public async findRecentPlan(limit = 20) {
    return (await this.findRecentQuery(limit)).explain()
  }

  public async findByHash(hash: string) {
    return await this.useCollection(async (collection: Collection<XyoBoundWitness>) => {
      return await collection.find({ _hash: hash, archive: this._archive }).maxTimeMS(this._maxTime).toArray()
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

export default BoundWitnessSdk
