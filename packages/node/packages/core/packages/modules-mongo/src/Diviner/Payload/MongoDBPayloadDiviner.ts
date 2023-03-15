import { AbstractDiviner, DivinerParams, XyoArchivistPayloadDivinerConfig, XyoArchivistPayloadDivinerConfigSchema } from '@xyo-network/diviner'
import { AnyConfigSchema } from '@xyo-network/module'
import { isPayloadQueryPayload, PayloadDiviner, PayloadQueryPayload, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Filter, SortDirection } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { DefaultLimit, DefaultMaxTimeMS, DefaultOrder } from '../../defaults'
import { getBaseMongoSdk, removeId } from '../../Mongo'

export type MongoDBPayloadDivinerParams = DivinerParams<AnyConfigSchema<XyoArchivistPayloadDivinerConfig>>

export class MongoDBPayloadDiviner<TParams extends MongoDBPayloadDivinerParams = MongoDBPayloadDivinerParams>
  extends AbstractDiviner<TParams>
  implements PayloadDiviner
{
  static override configSchema = XyoArchivistPayloadDivinerConfigSchema

  protected readonly sdk: BaseMongoSdk<XyoPayloadWithMeta> = getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads)

  override async divine(payloads?: XyoPayloads): Promise<XyoPayloads<XyoPayload>> {
    const query = payloads?.find<PayloadQueryPayload>(isPayloadQueryPayload)
    // TODO: Support multiple queries
    if (!query) return []
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { address, hash, limit, order, schema, schemas, timestamp, ...props } = query
    const parsedLimit = limit || DefaultLimit
    const parsedOrder = order || DefaultOrder
    const sort: { [key: string]: SortDirection } = { _timestamp: parsedOrder === 'asc' ? 1 : -1 }
    const filter: Filter<XyoPayloadWithMeta> = { ...props }
    if (timestamp) {
      const parsedTimestamp = timestamp ? timestamp : parsedOrder === 'desc' ? Date.now() : 0
      filter._timestamp = parsedOrder === 'desc' ? { $lt: parsedTimestamp } : { $gt: parsedTimestamp }
    }
    if (address) {
      if (Array.isArray(address)) {
        filter._archive = { $in: address }
      } else {
        filter._archive = address
      }
    }
    if (hash) filter._hash = hash
    // TODO: Optimize for single schema supplied too
    if (schemas?.length) filter.schema = { $in: schemas }
    return (await (await this.sdk.find(filter)).sort(sort).limit(parsedLimit).maxTimeMS(DefaultMaxTimeMS).toArray()).map(removeId)
  }
}
