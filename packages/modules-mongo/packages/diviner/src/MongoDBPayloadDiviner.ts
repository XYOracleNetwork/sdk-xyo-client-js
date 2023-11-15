import { PayloadDiviner } from '@xyo-network/diviner-payload-abstract'
import { isPayloadDivinerQueryPayload, PayloadDivinerConfigSchema, PayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import { DefaultLimit, DefaultMaxTimeMS, DefaultOrder, MongoDBModuleMixin, removeId } from '@xyo-network/module-abstract-mongodb'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWithMeta } from '@xyo-network/payload-mongodb'
import { Filter, SortDirection } from 'mongodb'

const MongoDBDivinerBase = MongoDBModuleMixin(PayloadDiviner)

export class MongoDBPayloadDiviner extends MongoDBDivinerBase {
  static override configSchemas = [PayloadDivinerConfigSchema]

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    const query = payloads?.find<PayloadDivinerQueryPayload>(isPayloadDivinerQueryPayload)
    // TODO: Support multiple queries
    if (!query) throw Error('Received payload is not a Query')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hash, limit, offset, order, schema, schemas, timestamp, ...props } = query
    const parsedLimit = limit || DefaultLimit
    const parsedOrder = order || DefaultOrder
    const parsedOffset = offset || 0
    const sort: { [key: string]: SortDirection } = { _timestamp: parsedOrder === 'asc' ? 1 : -1 }
    const filter: Filter<PayloadWithMeta> = {}
    if (timestamp) {
      const parsedTimestamp = timestamp ? timestamp : parsedOrder === 'desc' ? Date.now() : 0
      filter._timestamp = parsedOrder === 'desc' ? { $lt: parsedTimestamp } : { $gt: parsedTimestamp }
    }
    if (hash) filter._hash = hash
    // TODO: Optimize for single schema supplied too
    if (schemas?.length) filter.schema = { $in: schemas }

    // Add additional filter criteria
    if (Object.keys(props).length > 0) {
      const additionalFilterCriteria = Object.entries(props)
      for (const [prop, propFilter] of additionalFilterCriteria) {
        // Skip any reserved properties
        if (`${prop}`?.startsWith('$')) continue
        // Add the filter criteria
        filter[prop as keyof Payload] = Array.isArray(propFilter) ? { $in: propFilter } : (propFilter as string)
      }
    }

    const filtered = await this.payloads.find(filter)

    return (await filtered.sort(sort).skip(parsedOffset).limit(parsedLimit).maxTimeMS(DefaultMaxTimeMS).toArray()).map(removeId)
  }

  protected override async startHandler() {
    await super.startHandler()
    await this.ensureIndexes()
    return true
  }
}
