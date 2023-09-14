import { staticImplements } from '@xylabs/static-implements'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { DivinerParams } from '@xyo-network/diviner-model'
import {
  isPayloadDivinerQueryPayload,
  PayloadDivinerConfig,
  PayloadDivinerConfigSchema,
  PayloadDivinerQueryPayload,
} from '@xyo-network/diviner-payload-model'
import { AnyConfigSchema, WithLabels } from '@xyo-network/module'
import { PayloadWithMeta } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Filter, SortDirection } from 'mongodb'

import { DefaultLimit, DefaultMaxTimeMS, DefaultOrder } from '../../defaults'
import { MongoDBStorageClassLabels, removeId } from '../../Mongo'

export type MongoDBPayloadDivinerParams = DivinerParams<
  AnyConfigSchema<PayloadDivinerConfig>,
  {
    payloadSdk: BaseMongoSdk<PayloadWithMeta>
  }
>

@staticImplements<WithLabels<MongoDBStorageClassLabels>>()
export class MongoDBPayloadDiviner<TParams extends MongoDBPayloadDivinerParams = MongoDBPayloadDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [PayloadDivinerConfigSchema]
  static labels = MongoDBStorageClassLabels

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    const query = payloads?.find<PayloadDivinerQueryPayload>(isPayloadDivinerQueryPayload)
    // TODO: Support multiple queries
    if (!query) throw Error('Received payload is not a Query')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hash, limit, order, offset, schema, schemas, timestamp, ...props } = query
    const parsedLimit = limit ?? DefaultLimit
    const parsedOrder = order ?? DefaultOrder
    const parsedOffset = offset ?? 0
    const sort: { [key: string]: SortDirection } = { _timestamp: parsedOrder === 'asc' ? 1 : -1 }
    const filter: Filter<PayloadWithMeta> = {}
    if (timestamp) {
      const parsedTimestamp = timestamp ? timestamp : parsedOrder === 'desc' ? Date.now() : 0
      filter._timestamp = parsedOrder === 'desc' ? { $lt: parsedTimestamp } : { $gt: parsedTimestamp }
    }
    if (hash) filter._hash = hash
    // TODO: Optimize for single schema supplied too
    if (schemas?.length) filter.schema = { $in: schemas }
    return (
      await (await this.params.payloadSdk.find(filter)).sort(sort).skip(parsedOffset).limit(parsedLimit).maxTimeMS(DefaultMaxTimeMS).toArray()
    ).map(removeId)
  }
}
