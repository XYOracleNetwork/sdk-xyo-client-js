import { assertEx } from '@xylabs/assert'
import { AbstractArchivist, ArchivistFindQuerySchema, ArchivistInsertQuerySchema, ArchivistParams } from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema } from '@xyo-network/module'
import { prepareBoundWitnesses } from '@xyo-network/node-core-lib'
import {
  ArchiveModuleConfig,
  ArchiveModuleConfigSchema,
  XyoBoundWitnessFilterPredicate,
  XyoBoundWitnessMeta,
  XyoBoundWitnessWithMeta,
  XyoPayloadMeta,
  XyoPayloadWithPartialMeta,
} from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Filter, SortDirection } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { DefaultLimit, DefaultOrder } from '../../defaults'
import { getBaseMongoSdk, removeId } from '../../Mongo'

export type MongoDBArchiveBoundWitnessArchivistParams = ArchivistParams<
  AnyConfigSchema<ArchiveModuleConfig>,
  {
    boundWitnesses?: BaseMongoSdk<XyoBoundWitnessWithMeta>
  }
>

export class MongoDBArchiveBoundWitnessArchivist<
  TParams extends MongoDBArchiveBoundWitnessArchivistParams = MongoDBArchiveBoundWitnessArchivistParams,
> extends AbstractArchivist<TParams> {
  static override configSchema = ArchiveModuleConfigSchema

  private _boundWitnesses?: BaseMongoSdk<XyoBoundWitnessWithMeta>

  override get queries(): string[] {
    return [ArchivistInsertQuerySchema, ArchivistFindQuerySchema, ...super.queries]
  }

  protected get boundWitnesses() {
    this._boundWitnesses = this._boundWitnesses ?? getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
    return this._boundWitnesses
  }

  override async find(
    predicate: XyoBoundWitnessFilterPredicate,
  ): Promise<XyoBoundWitnessWithMeta<AnyObject, XyoPayloadWithPartialMeta<AnyObject>>[]> {
    const { addresses, limit, order, payload_hashes, payload_schemas, timestamp, ...props } = predicate
    const parsedLimit = limit || DefaultLimit
    const parsedOrder = order || DefaultOrder
    const sort: { [key: string]: SortDirection } = { _timestamp: parsedOrder === 'asc' ? 1 : -1 }
    const filter: Filter<XyoBoundWitnessWithMeta> = { _archive: this.config.archive, ...props }
    if (timestamp) {
      const parsedTimestamp = timestamp ? timestamp : parsedOrder === 'desc' ? Date.now() : 0
      filter._timestamp = parsedOrder === 'desc' ? { $lt: parsedTimestamp } : { $gt: parsedTimestamp }
    }
    // NOTE: Defaulting to $all since it makes the most sense when singing addresses are supplied
    // but based on how MongoDB implements multi-key indexes $in might be much faster and we could
    // solve the multi-sig problem via multiple API calls when multi-sig is desired instead of
    // potentially impacting performance for all single-address queries
    if (addresses?.length) filter.addresses = { $all: addresses }
    if (payload_hashes?.length) filter.payload_hashes = { $in: payload_hashes }
    if (payload_schemas?.length) filter.payload_schemas = { $in: payload_schemas }
    const result = (await (await this.boundWitnesses.find(filter)).sort(sort).limit(parsedLimit).maxTimeMS(2000).toArray()).map(removeId)
    return result
  }
  override async get(hashes: string[]): Promise<Array<XyoBoundWitnessWithMeta>> {
    const predicates = hashes.map((hash) => {
      const _archive = assertEx(this.config.archive, 'MongoDBArchiveBoundWitnessArchivist.get: Missing archive')
      const _hash = assertEx(hash, 'MongoDBArchiveBoundWitnessArchivist.get: Missing hash')
      return { _archive, _hash }
    })
    const queries = predicates.map(async (predicate) => {
      const result = (await (await this.boundWitnesses.find(predicate)).limit(1).toArray()).map(removeId)
      return result?.[0] || null
    })
    const results = await Promise.all(queries)
    return results
  }

  async insert(items: XyoBoundWitnessWithMeta[]): Promise<XyoBoundWitness[]> {
    const _timestamp = Date.now()
    const bws = items
      .map((bw) => {
        const _archive = assertEx(this.config.archive || bw._archive, 'MongoDBArchiveBoundWitnessArchivist.insert: Missing archive')
        const bwMeta: XyoBoundWitnessMeta = { _archive, _hash: new BoundWitnessWrapper(bw).hash, _timestamp }
        const payloadMeta: XyoPayloadMeta = { _archive, _hash: '', _timestamp }
        return prepareBoundWitnesses([bw], bwMeta, payloadMeta)
      })
      .map((r) => r.sanitized[0])
    // TODO: Should we insert payloads here too?
    const result = await this.boundWitnesses.insertMany(bws.map<XyoBoundWitnessWithMeta>(removeId))
    if (result.insertedCount != items.length) {
      throw new Error('MongoDBArchiveBoundWitnessArchivist.insert: Error inserting BoundWitnesses')
    }
    const [bw] = await this.bindResult(bws)
    return [bw]
  }
}
