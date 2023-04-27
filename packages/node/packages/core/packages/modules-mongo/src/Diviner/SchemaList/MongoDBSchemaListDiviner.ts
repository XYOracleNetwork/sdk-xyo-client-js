import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import {
  DivinerModule,
  DivinerParams,
  isSchemaListDivinerQueryPayload,
  SchemaListDiviner,
  SchemaListDivinerConfig,
  SchemaListDivinerConfigSchema,
  SchemaListDivinerQueryPayload,
  SchemaListDivinerSchema,
  SchemaListPayload,
} from '@xyo-network/diviner'
import { AnyConfigSchema } from '@xyo-network/module'
import { BoundWitnessWithMeta } from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

export type MongoDBSchemaListDivinerParams = DivinerParams<
  AnyConfigSchema<SchemaListDivinerConfig>,
  {
    boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta>
  }
>

export class MongoDBSchemaListDiviner<TParams extends MongoDBSchemaListDivinerParams = MongoDBSchemaListDivinerParams>
  extends AbstractDiviner<TParams>
  implements SchemaListDiviner, DivinerModule
{
  static override configSchema = SchemaListDivinerConfigSchema

  /**
   * The amount of time to allow the aggregate query to execute
   */
  protected readonly aggregateTimeoutMs = 10_000

  override async divine(payloads?: Payload[]): Promise<Payload<SchemaListPayload>[]> {
    const query = payloads?.find<SchemaListDivinerQueryPayload>(isSchemaListDivinerQueryPayload)
    const addresses = query?.address ? (Array.isArray(query?.address) ? query.address : [query.address]) : undefined
    const counts = addresses ? await Promise.all(addresses.map((address) => this.divineAddress(address))) : [await this.divineAllAddresses()]
    return counts.map((schemas) => new PayloadBuilder<SchemaListPayload>({ schema: SchemaListDivinerSchema }).fields({ schemas }).build())
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
