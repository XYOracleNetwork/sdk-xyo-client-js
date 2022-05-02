import { assertEx } from '@xylabs/sdk-js'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Collection, Filter, FindCursor, SortDirection, WithId } from 'mongodb'

import { XyoBoundWitness, XyoPayload } from '../../core'

export abstract class XyoQueryBuilder<T extends XyoBoundWitness | XyoPayload> extends BaseMongoSdk<T> {
  protected _archive = 'temp'
  protected _from: number = Date.now()
  protected _limit = 10
  protected _maxTime: number
  protected _schema = ''
  protected _searchDirection: 'asc' | 'desc' = 'desc'

  constructor(config: BaseMongoSdkConfig, maxTime = 2000) {
    super(config)
    this._maxTime = maxTime
  }

  protected abstract get filter(): Filter<T>

  protected get sort(): { _timestamp: SortDirection } {
    return this._searchDirection === 'desc' ? { _timestamp: -1 } : { _timestamp: 1 }
  }

  protected get filterTimestamp() {
    return this._searchDirection === 'desc' ? { $lte: this._from } : { $gte: this._from }
  }

  public build(): Promise<FindCursor<WithId<T>>> {
    return this.useCollection((collection: Collection<T>) => {
      return collection.find(this.filter).sort(this.sort).limit(this._limit).maxTimeMS(this._maxTime)
    })
  }

  public after(v: number): this {
    this._from = v
    this._searchDirection = 'asc'
    return this
  }

  public archive(v: string): this {
    this._archive = v
    return this
  }

  public before(v: number): this {
    this._from = v
    this._searchDirection = 'desc'
    return this
  }

  public limit(v: number): this {
    const int = parseInt(`${v}`) || 0
    assertEx(int > 0 && int <= 100, 'limit must be between 1 and 100')
    this._limit = v
    return this
  }

  public schema(v: string): this {
    this._schema = v
    return this
  }
}
