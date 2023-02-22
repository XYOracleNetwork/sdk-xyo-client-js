import {
  ArchiveModuleConfig,
  ArchiveModuleConfigSchema,
  ArchivePermissionsArchivist,
  SetArchivePermissionsPayload,
  SetArchivePermissionsSchema,
  XyoBoundWitnessWithMeta,
  XyoPayloadWithMeta,
} from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { COLLECTIONS } from '../../collections'
import { getBaseMongoSdk } from '../../Mongo'
import { AbstractMongoDBPayloadArchivist, AbstractMongoDBPayloadArchivistParams } from '../AbstractArchivist'

export class MongoDBArchivePermissionsPayloadPayloadArchivist
  extends AbstractMongoDBPayloadArchivist<SetArchivePermissionsPayload>
  implements ArchivePermissionsArchivist
{
  static override configSchema = ArchiveModuleConfigSchema

  protected readonly boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta>
  protected override readonly payloads: BaseMongoSdk<XyoPayloadWithMeta<SetArchivePermissionsPayload>>

  public constructor(params: AbstractMongoDBPayloadArchivistParams<ArchiveModuleConfig, SetArchivePermissionsPayload>) {
    super(params)
    this.boundWitnesses = params?.boundWitnesses || getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
    this.payloads = params?.payloads || getBaseMongoSdk<XyoPayloadWithMeta<SetArchivePermissionsPayload>>(COLLECTIONS.Payloads)
  }

  public get schema(): SetArchivePermissionsSchema {
    return SetArchivePermissionsSchema
  }

  static override async create(
    params?: Partial<AbstractMongoDBPayloadArchivistParams<ArchiveModuleConfig, SetArchivePermissionsPayload>>,
  ): Promise<MongoDBArchivePermissionsPayloadPayloadArchivist> {
    return (await super.create(params as Partial<AbstractMongoDBPayloadArchivistParams>)) as MongoDBArchivePermissionsPayloadPayloadArchivist
  }
}
