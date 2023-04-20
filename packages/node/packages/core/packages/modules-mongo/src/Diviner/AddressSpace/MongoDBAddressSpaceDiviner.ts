import { exists } from '@xylabs/exists'
import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { AbstractDiviner, AddressSpaceDiviner, AddressSpaceDivinerConfig, AddressSpaceDivinerConfigSchema, DivinerParams } from '@xyo-network/diviner'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { BoundWitnessWithMeta } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { COLLECTIONS } from '../../collections'
import { DATABASES } from '../../databases'
import { DefaultMaxTimeMS } from '../../defaults'

export type MongoDBAddressSpaceDivinerParams<TConfig extends AddressSpaceDivinerConfig = AddressSpaceDivinerConfig> = DivinerParams<
  AnyConfigSchema<TConfig>,
  {
    boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta>
  }
>

export class MongoDBAddressSpaceDiviner<TParams extends MongoDBAddressSpaceDivinerParams = MongoDBAddressSpaceDivinerParams>
  extends AbstractDiviner<TParams>
  implements AddressSpaceDiviner
{
  static override configSchema = AddressSpaceDivinerConfigSchema

  override async divine(_payloads?: Payload[]): Promise<Payload[]> {
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
