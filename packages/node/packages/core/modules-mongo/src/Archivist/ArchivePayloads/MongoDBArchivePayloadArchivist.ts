import { assertEx } from '@xylabs/assert'
import { EmptyObject } from '@xyo-network/core'
import { ModuleParams } from '@xyo-network/module'
import {
  AbstractPayloadArchivist,
  ArchiveModuleConfig,
  ArchivePayloadArchivist,
  XyoPayloadFilterPredicate,
  XyoPayloadWithMeta,
} from '@xyo-network/node-core-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Filter, SortDirection } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { DefaultLimit, DefaultOrder } from '../../defaults'
import { getBaseMongoSdk, removeId } from '../../Mongo'

export interface MongoDBArchivePayloadArchivistParams<T extends ArchiveModuleConfig = ArchiveModuleConfig> extends ModuleParams<T> {
  sdk: BaseMongoSdk<XyoPayloadWithMeta>
}

export class MongoDBArchivePayloadArchivist
  extends AbstractPayloadArchivist<XyoPayloadWithMeta, ArchiveModuleConfig>
  implements ArchivePayloadArchivist<XyoPayload, ArchiveModuleConfig>
{
  protected readonly sdk: BaseMongoSdk<XyoPayloadWithMeta>
  constructor(params: MongoDBArchivePayloadArchivistParams) {
    super(params)
    this.sdk = params?.sdk || getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads)
  }

  static override async create(params: MongoDBArchivePayloadArchivistParams) {
    return (await super.create(params)) as MongoDBArchivePayloadArchivist
  }

  async find(predicate?: XyoPayloadFilterPredicate): Promise<XyoPayloadWithMeta[]> {
    const { hash, limit, order, schema, schemas, timestamp, ...props } = predicate ?? {}
    const parsedLimit = limit || DefaultLimit
    const parsedOrder = order || DefaultOrder
    const sort: { [key: string]: SortDirection } = { _timestamp: parsedOrder === 'asc' ? 1 : -1 }
    const filter: Filter<XyoPayloadWithMeta<EmptyObject>> = { _archive: this.config.archive, ...props }
    if (timestamp) {
      const parsedTimestamp = timestamp ? timestamp : parsedOrder === 'desc' ? Date.now() : 0
      filter._timestamp = parsedOrder === 'desc' ? { $lt: parsedTimestamp } : { $gt: parsedTimestamp }
    }
    if (hash) filter._hash = hash
    if (schema) filter.schema = schema
    if (schemas?.length) filter.schema = { $in: schemas }
    return (await (await this.sdk.find(filter)).sort(sort).limit(parsedLimit).maxTimeMS(2000).toArray()).map(removeId)
  }

  async get(ids: string[]): Promise<Array<XyoPayloadWithMeta>> {
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

  async insert(items: XyoPayloadWithMeta[]) {
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
