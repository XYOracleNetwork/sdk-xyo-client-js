import { exists } from '@xylabs/exists'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { AddressSpaceDiviner } from '@xyo-network/diviner-address-space-abstract'
import { AddressSpaceDivinerConfig, AddressSpaceDivinerConfigSchema, DivinerParams } from '@xyo-network/diviner-models'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { BoundWitnessWithMeta } from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { COLLECTIONS } from '../../collections'
import { DATABASES } from '../../databases'
import { DefaultMaxTimeMS } from '../../defaults'

export type MongoDBMerkleAddressSpaceDivinerParams<TConfig extends AddressSpaceDivinerConfig = AddressSpaceDivinerConfig> = DivinerParams<
  AnyConfigSchema<TConfig>,
  {
    boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta>
  }
>

export class MongoDBMerkleAddressSpaceDiviner<
  TParams extends MongoDBMerkleAddressSpaceDivinerParams = MongoDBMerkleAddressSpaceDivinerParams,
> extends AddressSpaceDiviner<TParams> {
  static override configSchema = AddressSpaceDivinerConfigSchema

  protected paginationAccount: AccountInstance = new Account()

  override divine(_payloads?: Payload[]): Payload[] {
    const response = new PayloadBuilder({ schema: 'network.xyo.collection.pointer' })
      .fields({
        collectionAddresses: this.paginationAccount.addressValue.hex,
        collectionSchema: AddressSchema,
      })
      .build()
    return [response]
  }

  protected async backgroundDivine(): Promise<void> {
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
    const toStore = [...addresses].map((address) => {
      return { address, schema: AddressSchema }
    })
    // TODO: Store in archivist
  }
}
