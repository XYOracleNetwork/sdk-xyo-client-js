import 'reflect-metadata'

import { XyoAccount } from '@xyo-network/account'
import { XyoArchivistPayloadDivinerConfigSchema, XyoDiviner } from '@xyo-network/diviner'
import { Initializable, isPayloadQueryPayload, PayloadDiviner, PayloadQueryPayload, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Job, JobProvider, Logger } from '@xyo-network/shared'
import { inject, injectable } from 'inversify'
import { Filter, SortDirection } from 'mongodb'

import { DefaultLimit, DefaultMaxTimeMS, DefaultOrder } from '../../defaults'
import { removeId } from '../../Mongo'
import { MONGO_TYPES } from '../../types'

@injectable()
export class MongoDBPayloadDiviner extends XyoDiviner implements PayloadDiviner, Initializable, JobProvider {
  constructor(
    @inject(TYPES.Logger) logger: Logger,
    @inject(TYPES.Account) account: XyoAccount,
    @inject(MONGO_TYPES.PayloadSdkMongo) protected readonly sdk: BaseMongoSdk<XyoPayloadWithMeta>,
  ) {
    super({ account, config: { schema: XyoArchivistPayloadDivinerConfigSchema }, logger })
  }
  get jobs(): Job[] {
    return []
  }

  override async divine(payloads?: XyoPayloads): Promise<XyoPayloads<XyoPayload>> {
    const query = payloads?.find<PayloadQueryPayload>(isPayloadQueryPayload)
    // TODO: Support multiple queries
    if (!query) return []
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { archive, archives, hash, limit, order, schema, schemas, timestamp, ...props } = query
    const parsedLimit = limit || DefaultLimit
    const parsedOrder = order || DefaultOrder
    const sort: { [key: string]: SortDirection } = { _timestamp: parsedOrder === 'asc' ? 1 : -1 }
    const filter: Filter<XyoPayloadWithMeta> = { ...props }
    if (timestamp) {
      const parsedTimestamp = timestamp ? timestamp : parsedOrder === 'desc' ? Date.now() : 0
      filter._timestamp = parsedOrder === 'desc' ? { $lt: parsedTimestamp } : { $gt: parsedTimestamp }
    }
    if (archive) filter._archive = archive
    if (archives?.length) filter._archive = { $in: archives }
    if (hash) filter._hash = hash
    // TODO: Optimize for single schema supplied too
    if (schemas?.length) filter.schema = { $in: schemas }
    return (await (await this.sdk.find(filter)).sort(sort).limit(parsedLimit).maxTimeMS(DefaultMaxTimeMS).toArray()).map(removeId)
  }

  async initialize(): Promise<void> {
    await this.start()
  }
}
