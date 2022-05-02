import { assertEx } from '@xylabs/sdk-js'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Collection, SortDirection } from 'mongodb'

import { XyoBoundWitness } from '../../core'

// TODO: Make generic and support XyoBoundWitness | XyoPayload
export class XyoBoundWitnessQueryBuilder extends BaseMongoSdk<XyoBoundWitness> {
  private _archive = 'temp'
  private _maxTime: number
  private _searchDirection: 'asc' | 'desc' = 'desc'
  private _schema = ''
  private _limit = 10
  private _from: number = Date.now()

  constructor(config: BaseMongoSdkConfig, maxTime = 2000) {
    super(config)
    this._maxTime = maxTime
  }

  /**
   * Build the the query
   */
  // TODO: Make abstract and support queries for both XyoBoundWitness | XyoPayload
  public build() {
    const _archive = this._archive
    const _timestamp = this._searchDirection === 'desc' ? { $lte: this._from } : { $gte: this._from }
    const sort: { _timestamp: SortDirection } =
      this._searchDirection === 'desc' ? { _timestamp: -1 } : { _timestamp: 1 }
    // TODO: Search BW payload schemas instead?
    const _schema = this._schema ? { _schema: this._schema } : { _schema: { $exists: true } }
    const filter = { _archive, _schema, _timestamp }
    return this.useCollection((collection: Collection<XyoBoundWitness>) => {
      return collection.find(filter).sort(sort).limit(this._limit).maxTimeMS(this._maxTime)
    })
  }

  public get archive(): string {
    return this._archive
  }
  public set archive(v: string) {
    this._archive = v
  }

  public get schema(): string {
    return this._schema
  }
  public set schema(v: string) {
    this._schema = v
  }

  public set after(v: number) {
    this._from = v
    this._searchDirection = 'asc'
  }
  public set before(v: number) {
    this._from = v
    this._searchDirection = 'desc'
  }

  public get from() {
    return this._from
  }

  public get limit(): number {
    return this._limit
  }
  public set limit(v: number) {
    const int = parseInt(`${v}`) || 0
    assertEx(int > 0 && int <= 100, 'limit must be between 1 and 100')
    this._limit = v
  }
}
