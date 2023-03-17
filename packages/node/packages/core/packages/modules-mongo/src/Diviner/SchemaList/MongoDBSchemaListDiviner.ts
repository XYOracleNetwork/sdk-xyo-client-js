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
} from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

export type MongoDBSchemaListDivinerConfigSchema = 'network.xyo.module.config.diviner.stats.schema'
export const MongoDBSchemaListDivinerConfigSchema: MongoDBSchemaListDivinerConfigSchema = 'network.xyo.module.config.diviner.stats.schema'

export type MongoDBSchemaListDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  WithAdditional<
    Payload,
    T & {
      schema: MongoDBSchemaListDivinerConfigSchema
    }
  >
>

export type MongoDBSchemaListDivinerParams<T extends Payload = Payload> = DivinerParams<
  AnyConfigSchema<MongoDBSchemaListDivinerConfig<T>>,
  {
    addressSpaceDiviner: AddressSpaceDiviner
    boundWitnessSdk: BaseMongoSdk<XyoBoundWitnessWithMeta>
  }
>

export class MongoDBSchemaListDiviner<TParams extends MongoDBSchemaListDivinerParams = MongoDBSchemaListDivinerParams>
  extends AbstractDiviner<TParams>
  implements SchemaListDiviner, DivinerModule
{
  static override configSchema = MongoDBSchemaListDivinerConfigSchema

  /**
   * The amount of time to allow the aggregate query to execute
   */
  protected readonly aggregateTimeoutMs = 10_000

  override async divine(payloads?: Payload[]): Promise<Payload<SchemaListPayload>[]> {
    const query = payloads?.find<SchemaListQueryPayload>(isSchemaListQueryPayload)
    const addresses = query?.address ? (Array.isArray(query?.address) ? query.address : [query.address]) : undefined
    const counts = addresses ? await Promise.all(addresses.map((address) => this.divineAddress(address))) : [await this.divineAllAddresses()]
    return counts.map((schemas) => new PayloadBuilder<SchemaListPayload>({ schema: SchemaListSchema }).fields({ schemas }).build())
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

  private divineAllAddresses = async (): Promise<string[]> => {
    const result = await this.params.boundWitnessSdk.useCollection((collection) => {
      return collection.distinct('payload_schemas')
    })
    return result
  }
}
