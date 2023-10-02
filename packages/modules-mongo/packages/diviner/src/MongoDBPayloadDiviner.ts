import { PayloadDiviner } from '@xyo-network/diviner-payload-abstract'
import { isPayloadDivinerQueryPayload, PayloadDivinerConfigSchema, PayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import { DefaultLimit, DefaultMaxTimeMS, DefaultOrder, MongoDBModuleMixin, removeId } from '@xyo-network/module-abstract-mongodb'
import { PayloadWithMeta } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { Filter, SortDirection } from 'mongodb'

const MongoDBDivinerBase = MongoDBModuleMixin(PayloadDiviner)

export class MongoDBPayloadDiviner extends MongoDBDivinerBase {
  static override configSchemas = [PayloadDivinerConfigSchema]

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
    return (await (await this.payloads.find(filter)).sort(sort).skip(parsedOffset).limit(parsedLimit).maxTimeMS(DefaultMaxTimeMS).toArray()).map(
      removeId,
    )
  }

  protected override async startHandler() {
    await super.startHandler()
    await this.ensureIndexes()
    return true
  }
}
