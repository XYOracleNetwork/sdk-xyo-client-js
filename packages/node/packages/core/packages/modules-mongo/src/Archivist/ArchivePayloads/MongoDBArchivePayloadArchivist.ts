import { assertEx } from '@xylabs/assert'
import { AbstractArchivist, ArchivistFindQuerySchema, ArchivistInsertQuerySchema, ArchivistParams } from '@xyo-network/archivist'
import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema } from '@xyo-network/module'
import { ArchiveModuleConfig, ArchiveModuleConfigSchema, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { PayloadFindFilter, XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import compact from 'lodash/compact'
import { Filter, SortDirection } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { DefaultLimit, DefaultOrder } from '../../defaults'
import { getBaseMongoSdk, removeId } from '../../Mongo'

export type MongoDBArchivePayloadArchivistParams = ArchivistParams<
  AnyConfigSchema<ArchiveModuleConfig>,
  undefined,
  {
    sdk?: BaseMongoSdk<XyoPayloadWithMeta>
  }
>

export class MongoDBArchivePayloadArchivist<
  TParams extends MongoDBArchivePayloadArchivistParams = MongoDBArchivePayloadArchivistParams,
> extends AbstractArchivist<TParams> {
  static override configSchema = ArchiveModuleConfigSchema

  private _sdk: BaseMongoSdk<XyoPayloadWithMeta> | undefined

  constructor(params: TParams) {
    super(params)
  }

  override get queries(): string[] {
    return [ArchivistInsertQuerySchema, ArchivistFindQuerySchema, ...super.queries]
  }

  get sdk() {
    this._sdk = this._sdk ?? getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads)
    return this._sdk
  }

  override async find(predicate?: PayloadFindFilter): Promise<XyoPayload[]> {
    const { limit, order, schema, timestamp, ...props } = predicate ?? {}
    const parsedLimit = limit || DefaultLimit
    const parsedOrder = order || DefaultOrder
    const sort: { [key: string]: SortDirection } = { _timestamp: parsedOrder === 'asc' ? 1 : -1 }
    const filter: Filter<XyoPayloadWithMeta<AnyObject>> = { _archive: this.config.archive, ...props }
    if (timestamp) {
      const parsedTimestamp = timestamp ? timestamp : parsedOrder === 'desc' ? Date.now() : 0
      filter._timestamp = parsedOrder === 'desc' ? { $lt: parsedTimestamp } : { $gt: parsedTimestamp }
    }
    if (schema) {
      if (Array.isArray(schema)) {
        filter.schema = { $in: schema }
      } else {
        filter.schema = schema
      }
    }

    return compact(await (await this.sdk.find(filter)).sort(sort).limit(parsedLimit).maxTimeMS(2000).toArray()).map(removeId)
  }

  override async get(ids: string[]): Promise<Array<XyoPayloadWithMeta>> {
    const predicates = ids.map((id) => {
      const _archive = assertEx(this.config.archive, 'MongoDBArchivePayloadArchivist.get: Missing archive')
      const _hash = assertEx(id, 'MongoDBArchivePayloadArchivist.get: Missing hash')
      return { _archive, _hash }
    })
    const queries = predicates.map(async (predicate) => {
      const result = (await (await this.sdk.find(predicate)).limit(1).toArray()).map(removeId)
      return result?.[0] || null
    })
    const results = await Promise.all(queries)
    return results
  }

  override async insert(items: XyoPayloadWithMeta[]) {
    const payloads = items.map((p) => {
      return { ...p, _archive: this.config.archive, _hash: new PayloadWrapper(p).hash }
    })
    const result = await this.sdk.insertMany(payloads.map(removeId))
    if (result.insertedCount != items.length) {
      throw new Error('MongoDBArchivePayloadArchivist.insert: Error inserting Payloads')
    }
    const [bw] = await this.bindResult(items)
    return [bw]
  }
}
