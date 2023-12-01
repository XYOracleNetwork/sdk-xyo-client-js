import { flatten } from '@xylabs/array'
import { exists } from '@xylabs/exists'
import { hexFromHexString } from '@xylabs/hex'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-abstract'
import {
  BoundWitnessDivinerConfigSchema,
  BoundWitnessDivinerQueryPayload,
  isBoundWitnessDivinerQueryPayload,
} from '@xyo-network/diviner-boundwitness-model'
import { DefaultLimit, DefaultMaxTimeMS, DefaultOrder, MongoDBModuleMixin, removeId } from '@xyo-network/module-abstract-mongodb'
import { Payload } from '@xyo-network/payload-model'
import { BoundWitnessWithMeta } from '@xyo-network/payload-mongodb'
import { Filter, SortDirection } from 'mongodb'

const MongoDBDivinerBase = MongoDBModuleMixin(BoundWitnessDiviner)

export class MongoDBBoundWitnessDiviner extends MongoDBDivinerBase {
  static override configSchemas = [BoundWitnessDivinerConfigSchema]

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload<BoundWitness>[]> {
    const query = payloads?.find<BoundWitnessDivinerQueryPayload>(isBoundWitnessDivinerQueryPayload)
    // TODO: Support multiple queries
    if (!query) return []
    // NOTE: We're supporting address (which is deprecated) until we can ensure that all
    // clients are using addresses
    const { address, addresses, hash, limit, offset, order, payload_hashes, payload_schemas, timestamp } = query
    const parsedLimit = limit || DefaultLimit
    const parsedOrder = order || DefaultOrder
    const parsedOffset = offset || 0
    const sort: { [key: string]: SortDirection } = { _timestamp: parsedOrder === 'asc' ? 1 : -1 }
    const filter: Filter<BoundWitnessWithMeta> = {}
    if (timestamp) {
      // TODO: Should we sort by timestamp instead of _timestamp here as well?
      filter.timestamp = parsedOrder === 'desc' ? { $exists: true, $lt: timestamp } : { $exists: true, $gt: timestamp }
    }
    if (hash) filter._hash = hash
    // NOTE: Defaulting to $all since it makes the most sense when singing addresses are supplied
    // but based on how MongoDB implements multi-key indexes $in might be much faster and we could
    // solve the multi-sig problem via multiple API calls when multi-sig is desired instead of
    // potentially impacting performance for all single-address queries
    const allAddresses = flatten(address, addresses)
      .map((x) => hexFromHexString(x, { prefix: false }))
      .filter(exists)
    if (allAddresses.length) filter.addresses = allAddresses.length === 1 ? allAddresses[0] : { $all: allAddresses }
    if (payload_hashes?.length) filter.payload_hashes = { $in: payload_hashes }
    if (payload_schemas?.length) filter.payload_schemas = { $in: payload_schemas }
    return (
      await (await this.boundWitnesses.find(filter)).sort(sort).skip(parsedOffset).limit(parsedLimit).maxTimeMS(DefaultMaxTimeMS).toArray()
    ).map(removeId)
  }

  protected override async startHandler() {
    await super.startHandler()
    await this.ensureIndexes()
    return true
  }
}
