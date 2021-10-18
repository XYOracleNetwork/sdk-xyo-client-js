import { assertEx } from '@xyo-network/sdk-xyo-js'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Collection } from 'mongodb'

import { XyoBoundWitnessWrapper } from '../BoundWitness'
import { XyoBoundWitness } from '../models'

class BoundWitnessSdk extends BaseMongoSdk<XyoBoundWitness> {
  private _archive: string
  constructor(config: BaseMongoSdkConfig, archive: string) {
    super(config)
    this._archive = archive
  }

  public async findRecent(limit = 20) {
    return await this.useCollection(async (collection: Collection<XyoBoundWitness>) => {
      return await collection
        .find({ _archive: this._archive })
        .sort({ _archive: -1, _timestamp: -1 })
        .limit(limit)
        .toArray()
    })
  }

  public async findByHash(hash: string) {
    return await this.useCollection(async (collection: Collection<XyoBoundWitness>) => {
      return await collection.find({ _hash: hash, archive: this._archive }).toArray()
    })
  }

  public async sample(size: number) {
    assertEx(size <= 10, `size must be <= 10 [${size}]`)
    return await this.useCollection(async (collection: Collection<XyoBoundWitness>) => {
      return await collection.aggregate([{ $match: { _archive: this._archive } }, { $sample: { size } }]).toArray()
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
