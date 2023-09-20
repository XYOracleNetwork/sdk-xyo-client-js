import { staticImplements } from '@xylabs/static-implements'
import { DivinerParams } from '@xyo-network/diviner-model'
import { SchemaListDiviner } from '@xyo-network/diviner-schema-list-abstract'
import {
  isSchemaListQueryPayload,
  SchemaListDivinerConfig,
  SchemaListDivinerConfigSchema,
  SchemaListDivinerSchema,
  SchemaListPayload,
  SchemaListQueryPayload,
} from '@xyo-network/diviner-schema-list-model'
import { AnyConfigSchema, WithLabels } from '@xyo-network/module'
import { MongoDBStorageClassLabels } from '@xyo-network/module-model-mongodb'
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

@staticImplements<WithLabels<MongoDBStorageClassLabels>>()
export class MongoDBSchemaListDiviner<
  TParams extends MongoDBSchemaListDivinerParams = MongoDBSchemaListDivinerParams,
> extends SchemaListDiviner<TParams> {
  static override configSchemas = [SchemaListDivinerConfigSchema]
  static labels = MongoDBStorageClassLabels

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload<SchemaListPayload>[]> {
    const query = payloads?.find<SchemaListQueryPayload>(isSchemaListQueryPayload)
    const addresses = query?.address ? (Array.isArray(query?.address) ? query.address : [query.address]) : undefined
    const counts = addresses ? await Promise.all(addresses.map((address) => this.divineAddress(address))) : [await this.divineAllAddresses()]
    return counts.map((schemas) => new PayloadBuilder<SchemaListPayload>({ schema: SchemaListDivinerSchema }).fields({ schemas }).build())
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
