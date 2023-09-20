import { exists } from '@xylabs/exists'
import { staticImplements } from '@xylabs/static-implements'
import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { AddressSpaceDiviner } from '@xyo-network/diviner-address-space-abstract'
import { AddressSpaceDivinerConfig, AddressSpaceDivinerConfigSchema, DivinerParams } from '@xyo-network/diviner-models'
import { DefaultMaxTimeMS } from '@xyo-network/module-abstract-mongodb'
import { AnyConfigSchema, WithLabels } from '@xyo-network/module-model'
import { MongoDBStorageClassLabels } from '@xyo-network/module-model-mongodb'
import { BoundWitnessWithMeta } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { COLLECTIONS } from '../../collections'
import { DATABASES } from '../../databases'

export type MongoDBAddressSpaceDivinerParams<TConfig extends AddressSpaceDivinerConfig = AddressSpaceDivinerConfig> = DivinerParams<
  AnyConfigSchema<TConfig>,
  {
    boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta>
  }
>

@staticImplements<WithLabels<MongoDBStorageClassLabels>>()
export class MongoDBAddressSpaceDiviner<
  TParams extends MongoDBAddressSpaceDivinerParams = MongoDBAddressSpaceDivinerParams,
> extends AddressSpaceDiviner<TParams> {
  static override configSchemas = [AddressSpaceDivinerConfigSchema]
  static labels = MongoDBStorageClassLabels

  protected override async divineHandler(_payloads?: Payload[]): Promise<Payload[]> {
    // TODO: Most Recently Used, Most Frequently Used, Addresses of Value/Importance to Me
    const result = await this.params.boundWitnessSdk.useMongo((db) => {
      return db.db(DATABASES.Archivist).command(
        {
          distinct: COLLECTIONS.BoundWitnesses,
          key: 'addresses',
        },
        { maxTimeMS: DefaultMaxTimeMS },
      )
    })
    // Ensure uniqueness on case
    const addresses = new Set<string>(result?.values?.map((address: string) => address?.toLowerCase()).filter(exists))
    return [...addresses].map((address) => {
      return { address, schema: AddressSchema }
    })
  }
}
