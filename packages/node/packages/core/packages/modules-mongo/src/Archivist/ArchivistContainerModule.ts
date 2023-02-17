import { AbstractArchivist } from '@xyo-network/archivist'
import { AbstractModule, AbstractModuleConfigSchema } from '@xyo-network/module'
import {
  ArchiveArchivist,
  ArchiveKeyRepository,
  ArchiveModuleConfigSchema,
  BoundWitnessArchivist,
  PayloadArchivist,
  UserArchivist,
  WitnessedPayloadArchivist,
} from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { AsyncContainerModule, interfaces } from 'inversify'

import { MongoDBArchiveArchivist } from './Archive'
import { MongoDBArchiveKeyRepository } from './ArchiveKey'
import { MongoDBBoundWitnessArchivist } from './BoundWitness'
import { MongoDBDeterministicArchivist } from './Deterministic'
import { MongoDBPayloadArchivist } from './Payload'
import { MongoDBUserArchivist } from './User'
import { MongoDBArchivistWitnessedPayloadArchivist } from './WitnessedPayload'

export const ArchivistContainerModule = new AsyncContainerModule(async (bind: interfaces.Bind) => {
  bind(MongoDBArchiveArchivist).toConstantValue(new MongoDBArchiveArchivist())
  bind<ArchiveArchivist>(TYPES.ArchiveArchivist).toService(MongoDBArchiveArchivist)

  bind(MongoDBArchiveKeyRepository).toConstantValue(new MongoDBArchiveKeyRepository())
  bind<ArchiveKeyRepository>(TYPES.ArchiveKeyRepository).toService(MongoDBArchiveKeyRepository)

  const mongoDBBoundWitnessArchivist = await MongoDBBoundWitnessArchivist.create({
    config: { name: TYPES.BoundWitnessArchivist.description, schema: ArchiveModuleConfigSchema },
  })
  bind(MongoDBBoundWitnessArchivist).toConstantValue(mongoDBBoundWitnessArchivist)
  bind<BoundWitnessArchivist>(TYPES.BoundWitnessArchivist).toService(MongoDBBoundWitnessArchivist)
  bind<AbstractModule>(TYPES.Module).toService(MongoDBBoundWitnessArchivist)

  const mongoDBPayloadArchivist = await MongoDBPayloadArchivist.create({
    config: { name: TYPES.PayloadArchivist.description, schema: ArchiveModuleConfigSchema },
  })
  bind(MongoDBPayloadArchivist).toConstantValue(mongoDBPayloadArchivist)
  bind<PayloadArchivist>(TYPES.PayloadArchivist).toService(MongoDBPayloadArchivist)
  bind<AbstractModule>(TYPES.Module).toService(MongoDBPayloadArchivist)

  bind(MongoDBUserArchivist).toConstantValue(new MongoDBUserArchivist())
  bind<UserArchivist>(TYPES.UserArchivist).toService(MongoDBUserArchivist)

  const mongoDBArchivistWitnessedPayloadArchivist = await MongoDBArchivistWitnessedPayloadArchivist.create()
  bind(MongoDBArchivistWitnessedPayloadArchivist).toConstantValue(mongoDBArchivistWitnessedPayloadArchivist)
  bind<WitnessedPayloadArchivist>(TYPES.WitnessedPayloadArchivist).toService(MongoDBArchivistWitnessedPayloadArchivist)
  bind<AbstractModule>(TYPES.Module).toService(MongoDBArchivistWitnessedPayloadArchivist)

  const archivist = await MongoDBDeterministicArchivist.create({
    config: { schema: ArchiveModuleConfigSchema },
  })
  bind(MongoDBDeterministicArchivist).toConstantValue(archivist)
  bind<AbstractArchivist>(TYPES.Archivist).toService(MongoDBDeterministicArchivist)
  bind<AbstractModule>(TYPES.Module).toService(MongoDBDeterministicArchivist)
})
