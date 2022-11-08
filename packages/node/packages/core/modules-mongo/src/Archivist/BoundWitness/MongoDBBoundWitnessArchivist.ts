import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { prepareBoundWitnesses } from '@xyo-network/node-core-lib'
import {
  AbstractBoundWitnessArchivist,
  XyoBoundWitnessFilterPredicate,
  XyoBoundWitnessMeta,
  XyoBoundWitnessWithMeta,
  XyoPayloadMeta,
} from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { PayloadWrapper } from '@xyo-network/payload'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { inject, injectable } from 'inversify'
import { Filter, SortDirection } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { DefaultLimit, DefaultOrder } from '../../defaults'
import { getBaseMongoSdk, removeId } from '../../Mongo'

@injectable()
export class MongoDBBoundWitnessArchivist extends AbstractBoundWitnessArchivist {
  constructor(
    @inject(TYPES.Account) protected readonly account: XyoAccount,
    protected readonly sdk: BaseMongoSdk<XyoBoundWitnessWithMeta> = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses),
  ) {
    super(account)
  }
  async find(predicate: XyoBoundWitnessFilterPredicate): Promise<XyoBoundWitnessWithMeta[]> {
    const { _archive, archives, addresses, hash, limit, order, payload_hashes, payload_schemas, timestamp, ...props } = predicate
    const parsedLimit = limit || DefaultLimit
    const parsedOrder = order || DefaultOrder
    const sort: { [key: string]: SortDirection } = { _timestamp: parsedOrder === 'asc' ? 1 : -1 }
    const filter: Filter<XyoBoundWitnessWithMeta> = { ...props }
    if (timestamp) {
      const parsedTimestamp = timestamp ? timestamp : parsedOrder === 'desc' ? Date.now() : 0
      filter._timestamp = parsedOrder === 'desc' ? { $lt: parsedTimestamp } : { $gt: parsedTimestamp }
    }
    if (_archive) filter._archive = _archive
    if (archives?.length) filter._archive = { $in: archives }
    if (hash) filter._hash = hash
    // NOTE: Defaulting to $all since it makes the most sense when singing addresses are supplied
    // but based on how MongoDB implements multi-key indexes $in might be much faster and we could
    // solve the multi-sig problem via multiple API calls when multi-sig is desired instead of
    // potentially impacting performance for all single-address queries
    if (addresses?.length) filter.addresses = { $all: addresses }
    if (payload_hashes?.length) filter.payload_hashes = { $in: payload_hashes }
    if (payload_schemas?.length) filter.payload_schemas = { $in: payload_schemas }
    return (await (await this.sdk.find(filter)).sort(sort).limit(parsedLimit).maxTimeMS(2000).toArray()).map(removeId)
  }
  async get(hashes: string[]): Promise<XyoBoundWitnessWithMeta[]> {
    // NOTE: This assumes at most 1 of each hash is stored which is currently not the case
    const limit = hashes.length
    assertEx(limit > 0, 'MongoDBBoundWitnessArchivist.get: No hashes supplied')
    assertEx(limit < 10, 'MongoDBBoundWitnessArchivist.get: Retrieval of > 100 hashes at a time not supported')
    return (await (await this.sdk.find({ _hash: { $in: hashes } })).limit(hashes.length).toArray()).map(removeId)
  }
  async insert(items: XyoBoundWitnessWithMeta[]): Promise<XyoBoundWitness[]> {
    const _timestamp = Date.now()
    const bws = items
      .map((bw) => {
        const _archive = assertEx(bw._archive, 'MongoDBBoundWitnessArchivist.insert: Missing archive')
        const bwMeta: XyoBoundWitnessMeta = { _archive, _hash: new PayloadWrapper(bw).hash, _timestamp }
        const payloadMeta: XyoPayloadMeta = { _archive, _hash: '', _timestamp }
        return prepareBoundWitnesses([bw], bwMeta, payloadMeta)
      })
      .map((r) => r.sanitized[0])
    // TODO: Should we insert payloads here too?
    const result = await this.sdk.insertMany(bws.map(removeId))
    if (result.insertedCount != items.length) {
      throw new Error('MongoDBBoundWitnessArchivist.insert: Error inserting BoundWitnesses')
    }
    const [bw] = await this.bindResult(bws)
    return [bw]
  }
}
