import { AddressSchema } from '@xyo-network/address-payload-plugin'
import {
  AbstractDiviner,
  AddressSpaceDiviner,
  AddressSpaceQueryPayload,
  DivinerConfig,
  isAddressSpaceQueryPayload,
  XyoArchivistPayloadDivinerConfig,
  XyoArchivistPayloadDivinerConfigSchema,
} from '@xyo-network/diviner'
import { ModuleParams } from '@xyo-network/module'
import { XyoBoundWitnessWithMeta } from '@xyo-network/node-core-model'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { XyoPayloads } from '@xyo-network/payload-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { COLLECTIONS } from '../../collections'
import { DATABASES } from '../../databases'
import { DefaultMaxTimeMS } from '../../defaults'
import { getBaseMongoSdk } from '../../Mongo'

export type MongoDBDeterministicArchivistParams<TConfig extends DivinerConfig = DivinerConfig> = ModuleParams<
  TConfig,
  {
    boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta>
  }
>

export class MongoDBAddressSpaceDiviner extends AbstractDiviner implements AddressSpaceDiviner {
  static override configSchema = XyoArchivistPayloadDivinerConfigSchema

  protected readonly sdk: BaseMongoSdk<XyoBoundWitnessWithMeta>

  constructor(params: MongoDBDeterministicArchivistParams<DivinerConfig>) {
    super(params)
    this.sdk = params?.boundWitnesses || getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
  }

  static override async create(params?: Partial<ModuleParams<XyoArchivistPayloadDivinerConfig>>): Promise<MongoDBAddressSpaceDiviner> {
    return (await super.create(params)) as MongoDBAddressSpaceDiviner
  }

  override async divine(payloads?: XyoPayloads): Promise<XyoPayloads> {
    const query = payloads?.find<AddressSpaceQueryPayload>(isAddressSpaceQueryPayload)
    if (!query) return []
    // Issue a distinct query against the BoundWitnesses collection
    // on the address field
    const result = await this.sdk.useMongo((db) => {
      return db.db(DATABASES.Archivist).command(
        {
          distinct: COLLECTIONS.BoundWitnesses,
          key: 'addresses',
        },
        { maxTimeMS: DefaultMaxTimeMS },
      )
    })
    // Ensure uniqueness on case
    const addresses = new Set<string>(result?.values?.map((address: string) => address?.toLowerCase()))
    return [...addresses].map((address) => new XyoPayloadBuilder({ schema: AddressSchema }).fields({ address }).build())
  }
}
