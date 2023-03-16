import { WithAdditional } from '@xyo-network/core'
import { AbstractDiviner, AddressSpaceDiviner, DivinerConfig, DivinerModule, DivinerParams } from '@xyo-network/diviner'
import { AnyConfigSchema } from '@xyo-network/module'
import {
  isSchemaListQueryPayload,
  SchemaListDiviner,
  SchemaListPayload,
  SchemaListQueryPayload,
  SchemaListSchema,
  XyoBoundWitnessWithMeta,
  XyoPayloadWithMeta,
} from '@xyo-network/node-core-model'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

export type MongoDBSchemaListDivinerConfigSchema = 'network.xyo.module.config.diviner.stats.schema'
export const MongoDBSchemaListDivinerConfigSchema: MongoDBSchemaListDivinerConfigSchema = 'network.xyo.module.config.diviner.stats.schema'

export type MongoDBSchemaListDivinerConfig<T extends XyoPayload = XyoPayload> = DivinerConfig<
  WithAdditional<
    XyoPayload,
    T & {
      schema: MongoDBSchemaListDivinerConfigSchema
    }
  >
>

export type MongoDBSchemaListDivinerParams<T extends XyoPayload = XyoPayload> = DivinerParams<
  AnyConfigSchema<MongoDBSchemaListDivinerConfig<T>>,
  {
    addressSpaceDiviner: AddressSpaceDiviner
    boundWitnessSdk: BaseMongoSdk<XyoBoundWitnessWithMeta>
    payloadSdk: BaseMongoSdk<XyoPayloadWithMeta>
  }
>

export class MongoDBSchemaListDiviner<TParams extends MongoDBSchemaListDivinerParams = MongoDBSchemaListDivinerParams>
  extends AbstractDiviner<TParams>
  implements SchemaListDiviner, DivinerModule
{
  static override configSchema = MongoDBSchemaListDivinerConfigSchema

  /**
   * The max number of records to search during the aggregate query
   */
  protected readonly aggregateLimit = 5_000_000

  /**
   * The max number of iterations of aggregate queries to allow when
   * divining the schema stats within an archive
   */
  protected readonly aggregateMaxIterations = 10_000

  /**
   * The amount of time to allow the aggregate query to execute
   */
  protected readonly aggregateTimeoutMs = 10_000

  override async divine(payloads?: XyoPayloads): Promise<XyoPayloads<SchemaListPayload>> {
    const query = payloads?.find<SchemaListQueryPayload>(isSchemaListQueryPayload)
    const addresses = query?.address ? (Array.isArray(query?.address) ? query.address : [query.address]) : undefined
    const counts = addresses ? await Promise.all(addresses.map((address) => this.divineAddress(address))) : [await this.divineAllAddresses()]
    return counts.map((schemas) => new XyoPayloadBuilder<SchemaListPayload>({ schema: SchemaListSchema }).fields({ schemas }).build())
  }

  override async start() {
    await super.start()
  }

  protected override async stop(): Promise<this> {
    return await super.stop()
  }

  private divineAddress = async (archive: string): Promise<string[]> => {
    const result = await this.params.boundWitnessSdk.useCollection((collection) => {
      return collection.distinct('payload_schemas', { addresses: { $in: [archive] } })
    })
    return result
  }

  private divineAllAddresses = async () => await Promise.reject('Not Implemented')
}
