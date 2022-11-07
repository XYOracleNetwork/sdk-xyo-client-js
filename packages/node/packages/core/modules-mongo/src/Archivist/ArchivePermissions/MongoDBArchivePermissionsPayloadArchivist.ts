import 'reflect-metadata'

import { XyoAccount } from '@xyo-network/account'
import {
  ArchiveModuleConfig,
  ArchivePermissionsArchivist,
  SetArchivePermissionsPayload,
  SetArchivePermissionsSchema,
  XyoBoundWitnessWithMeta,
  XyoPayloadWithMeta,
} from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { inject, named } from 'inversify'

import { MONGO_TYPES } from '../../types'
import { AbstractMongoDBPayloadArchivist } from '../AbstractArchivist'

export class MongoDBArchivePermissionsPayloadPayloadArchivist
  extends AbstractMongoDBPayloadArchivist<SetArchivePermissionsPayload>
  implements ArchivePermissionsArchivist
{
  public constructor(
    @inject(TYPES.Account) @named('root') protected readonly account: XyoAccount,
    @inject(MONGO_TYPES.PayloadSdkMongo) protected readonly payloads: BaseMongoSdk<XyoPayloadWithMeta<SetArchivePermissionsPayload>>,
    @inject(MONGO_TYPES.BoundWitnessSdkMongo) protected readonly boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta>,
    config: ArchiveModuleConfig,
  ) {
    super(account, payloads, boundWitnesses, config)
  }

  public get schema(): SetArchivePermissionsSchema {
    return SetArchivePermissionsSchema
  }
}
