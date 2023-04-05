import { exists } from '@xylabs/exists'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractDiviner, DivinerParams, XyoArchivistPayloadDivinerConfig, XyoArchivistPayloadDivinerConfigSchema } from '@xyo-network/diviner'
import { AnyConfigSchema } from '@xyo-network/module'
import { BoundWitnessDiviner, BoundWitnessQueryPayload, BoundWitnessWithMeta, isBoundWitnessQueryPayload } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Filter, SortDirection } from 'mongodb'

import { DefaultLimit, DefaultMaxTimeMS, DefaultOrder } from '../../defaults'
import { removeId } from '../../Mongo'

export type MongoDBBoundWitnessDivinerParams = DivinerParams<
  AnyConfigSchema<XyoArchivistPayloadDivinerConfig>,
  {
    boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta>
  }
>
export class MongoDBBoundWitnessDiviner<TParams extends MongoDBBoundWitnessDivinerParams = MongoDBBoundWitnessDivinerParams>
  extends AbstractDiviner<TParams>
  implements BoundWitnessDiviner
{
  static override configSchema = XyoArchivistPayloadDivinerConfigSchema

  override async divine(payloads?: Payload[]): Promise<Payload<BoundWitness>[]> {
    const query = payloads?.find<BoundWitnessQueryPayload>(isBoundWitnessQueryPayload)
    // TODO: Support multiple queries
    if (!query) return []
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { address, addresses, hash, limit, order, payload_hashes, payload_schemas, schema, timestamp, ...props } = query
    const parsedLimit = limit || DefaultLimit
    const parsedOrder = order || DefaultOrder
    const sort: { [key: string]: SortDirection } = { _timestamp: parsedOrder === 'asc' ? 1 : -1 }
    const filter: Filter<BoundWitnessWithMeta> = {}
    if (timestamp) {
      const parsedTimestamp = timestamp ? timestamp : parsedOrder === 'desc' ? Date.now() : 0
      filter._timestamp = parsedOrder === 'desc' ? { $lt: parsedTimestamp } : { $gt: parsedTimestamp }
    }
    if (hash) filter._hash = hash
    // NOTE: Defaulting to $all since it makes the most sense when singing addresses are supplied
    // but based on how MongoDB implements multi-key indexes $in might be much faster and we could
    // solve the multi-sig problem via multiple API calls when multi-sig is desired instead of
    // potentially impacting performance for all single-address queries
    const allAddresses = concatArrays(address, addresses)
    if (allAddresses.length) filter.addresses = allAddresses.length === 1 ? allAddresses[0] : { $all: allAddresses }
    if (payload_hashes?.length) filter.payload_hashes = { $in: payload_hashes }
    if (payload_schemas?.length) filter.payload_schemas = { $in: payload_schemas }
    return (await (await this.params.boundWitnessSdk.find(filter)).sort(sort).limit(parsedLimit).maxTimeMS(DefaultMaxTimeMS).toArray()).map(removeId)
  }
}

const concatArrays = (a: string | string[] | undefined, b: string | string[] | undefined): string[] => {
  return ([] as (string | undefined)[])
    .concat(a)
    .concat(b)
    .filter(exists)
    .map((x) => x.toLowerCase())
    .map((x) => (x.startsWith('0x') ? x.substring(2) : x))
}
