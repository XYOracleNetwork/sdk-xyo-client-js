import { assertEx } from '@xylabs/assert'
import { AbstractArchivist, ArchivistFindQuerySchema, ArchivistInsertQuerySchema, ArchivistParams } from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema, ModuleConfig, ModuleConfigSchema } from '@xyo-network/module'
import { XyoPayloadFilterPredicate, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Filter, SortDirection } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { DefaultLimit, DefaultOrder } from '../../defaults'
import { getBaseMongoSdk, removeId } from '../../Mongo'

export type MongoDBPayloadArchivistParams<TConfig extends ModuleConfig = ModuleConfig, T extends AnyObject = AnyObject> = ArchivistParams<
  AnyConfigSchema<TConfig>,
  undefined,
  {
    sdk?: BaseMongoSdk<XyoPayloadWithMeta<T>>
  }
>

export class MongoDBPayloadArchivist<
  TParams extends MongoDBPayloadArchivistParams = MongoDBPayloadArchivistParams,
> extends AbstractArchivist<TParams> {
  static override configSchema = ModuleConfigSchema

  protected readonly sdk: BaseMongoSdk<XyoPayloadWithMeta>

  constructor(params: TParams) {
    super(params)
    this.sdk = params?.sdk || getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads)
  }

  override get queries(): string[] {
    return [ArchivistInsertQuerySchema, ArchivistFindQuerySchema, ...super.queries]
  }

  override async find(predicate: XyoPayloadFilterPredicate<XyoPayloadWithMeta>): Promise<XyoPayloadWithMeta[]> {
    const { _archive, archives, limit, order, schema, schemas, timestamp, ...props } = predicate
    const parsedLimit = limit || DefaultLimit
    const parsedOrder = order || DefaultOrder
    const filter: Filter<XyoPayloadWithMeta<AnyObject>> = { ...props }
    const sort: { [key: string]: SortDirection } = { _timestamp: parsedOrder === 'asc' ? 1 : -1 }
    if (timestamp) {
      const parsedTimestamp = timestamp ? timestamp : parsedOrder === 'desc' ? Date.now() : 0
      filter._timestamp = parsedOrder === 'desc' ? { $lt: parsedTimestamp } : { $gt: parsedTimestamp }
    }
    if (_archive) filter._archive = _archive
    if (archives?.length) filter._archive = { $in: archives }
    if (schema) filter.schema = schema
    if (schemas?.length) filter.schema = { $in: schemas }
    return (await (await this.sdk.find(filter)).sort(sort).limit(parsedLimit).maxTimeMS(2000).toArray()).map(removeId)
  }

  override async get(hashes: string[]): Promise<XyoPayloadWithMeta[]> {
    // NOTE: This assumes at most 1 of each hash is stored which is currently not the case
    const limit = hashes.length
    assertEx(limit > 0, 'MongoDBPayloadArchivist.get: No hashes supplied')
    assertEx(limit < 10, 'MongoDBPayloadArchivist.get: Retrieval of > 100 hashes at a time not supported')
    return (await (await this.sdk.find({ _hash: { $in: hashes } })).sort({ _timestamp: -1 }).limit(limit).toArray()).map(removeId)
  }

  override async insert(items: XyoPayloadWithMeta[]): Promise<XyoBoundWitness[]> {
    const result = await this.sdk.insertMany(items.map(removeId) as XyoPayloadWithMeta[])
    if (result.insertedCount != items.length) {
      throw new Error('MongoDBPayloadArchivist.insert: Error inserting Payloads')
    }
    const [bw] = await this.bindResult(items)
    return [bw]
  }
}
