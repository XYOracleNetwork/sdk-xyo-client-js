import { exists } from '@xylabs/exists'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoArchivistPayloadDivinerConfig, XyoDiviner } from '@xyo-network/diviner'
import { XyoModuleParams } from '@xyo-network/module'
import {
  BoundWitnessDiviner,
  BoundWitnessQueryPayload,
  Initializable,
  isBoundWitnessQueryPayload,
  XyoBoundWitnessWithMeta,
} from '@xyo-network/node-core-model'
import { XyoPayloads } from '@xyo-network/payload'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Job, JobProvider } from '@xyo-network/shared'
import { Filter, SortDirection } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { DefaultLimit, DefaultMaxTimeMS, DefaultOrder } from '../../defaults'
import { getBaseMongoSdk, removeId } from '../../Mongo'

export class MongoDBBoundWitnessDiviner extends XyoDiviner implements BoundWitnessDiviner, Initializable, JobProvider {
  protected readonly sdk: BaseMongoSdk<XyoBoundWitnessWithMeta> = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)

  get jobs(): Job[] {
    return [
      // {
      //   name: 'MongoDBBoundWitnessDiviner.DivineBatch',
      //   schedule: '10 minute',
      //   task: async () => await this.divineArchivesBatch(),
      // },
    ]
  }

  static override async create(params?: Partial<XyoModuleParams<XyoArchivistPayloadDivinerConfig>>): Promise<MongoDBBoundWitnessDiviner> {
    return (await super.create(params)) as MongoDBBoundWitnessDiviner
  }

  override async divine(payloads?: XyoPayloads): Promise<XyoPayloads<XyoBoundWitness>> {
    const query = payloads?.find<BoundWitnessQueryPayload>(isBoundWitnessQueryPayload)
    // TODO: Support multiple queries
    if (!query) return []
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { archive, archives, address, addresses, hash, limit, order, payload_hashes, payload_schemas, schema, timestamp, ...props } = query
    const parsedLimit = limit || DefaultLimit
    const parsedOrder = order || DefaultOrder
    const sort: { [key: string]: SortDirection } = { _timestamp: parsedOrder === 'asc' ? 1 : -1 }
    const filter: Filter<XyoBoundWitnessWithMeta> = { ...props }
    if (timestamp) {
      const parsedTimestamp = timestamp ? timestamp : parsedOrder === 'desc' ? Date.now() : 0
      filter._timestamp = parsedOrder === 'desc' ? { $lt: parsedTimestamp } : { $gt: parsedTimestamp }
    }
    if (archive) filter._archive = archive
    if (archives?.length) filter._archive = { $in: archives }
    if (hash) filter._hash = hash
    // NOTE: Defaulting to $all since it makes the most sense when singing addresses are supplied
    // but based on how MongoDB implements multi-key indexes $in might be much faster and we could
    // solve the multi-sig problem via multiple API calls when multi-sig is desired instead of
    // potentially impacting performance for all single-address queries
    const allAddresses = concatArrays(address, addresses)
    if (allAddresses.length) filter.addresses = allAddresses.length === 1 ? allAddresses[0] : { $all: allAddresses }
    if (payload_hashes?.length) filter.payload_hashes = { $in: payload_hashes }
    if (payload_schemas?.length) filter.payload_schemas = { $in: payload_schemas }
    return (await (await this.sdk.find(filter)).sort(sort).limit(parsedLimit).maxTimeMS(DefaultMaxTimeMS).toArray()).map(removeId)
  }

  async initialize(): Promise<void> {
    await this.start()
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
