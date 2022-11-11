import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import {
  ArchiveModuleConfig,
  ArchivePermissionsArchivist,
  SetArchivePermissionsPayload,
  SetArchivePermissionsSchema,
  XyoBoundWitnessWithMeta,
  XyoPayloadWithMeta,
} from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { COLLECTIONS } from '../../collections'
import { getBaseMongoSdk } from '../../Mongo'
import { AbstractMongoDBPayloadArchivist } from '../AbstractArchivist'

export class MongoDBArchivePermissionsPayloadPayloadArchivist
  extends AbstractMongoDBPayloadArchivist<SetArchivePermissionsPayload>
  implements ArchivePermissionsArchivist
{
  public constructor(
    protected readonly account: XyoAccount = new XyoAccount({ phrase: assertEx(process.env.ACCOUNT_SEED) }),
    protected readonly payloads: BaseMongoSdk<XyoPayloadWithMeta<SetArchivePermissionsPayload>> = getBaseMongoSdk<
      XyoPayloadWithMeta<SetArchivePermissionsPayload>
    >(COLLECTIONS.Payloads),
    protected readonly boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta> = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses),
    config: ArchiveModuleConfig,
  ) {
    super(account, payloads, boundWitnesses, config)
  }

  public get schema(): SetArchivePermissionsSchema {
    return SetArchivePermissionsSchema
  }
}
