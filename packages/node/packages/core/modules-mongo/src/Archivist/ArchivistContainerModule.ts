import { AbstractModule } from '@xyo-network/module'
import {
  ArchiveArchivist,
  ArchiveKeyRepository,
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
import { MongoDBPayloadArchivist } from './Payload'
import { MongoDBUserArchivist } from './User'
import { MongoDBArchivistWitnessedPayloadArchivist } from './WitnessedPayload'

export const ArchivistContainerModule = new AsyncContainerModule(async (bind: interfaces.Bind) => {
  bind(MongoDBArchiveArchivist).toConstantValue(new MongoDBArchiveArchivist())
  bind<ArchiveArchivist>(TYPES.ArchiveArchivist).toService(MongoDBArchiveArchivist)

  bind(MongoDBArchiveKeyRepository).toConstantValue(new MongoDBArchiveKeyRepository())
  bind<ArchiveKeyRepository>(TYPES.ArchiveKeyRepository).toService(MongoDBArchiveKeyRepository)

  const mongoDBBoundWitnessArchivist = await MongoDBBoundWitnessArchivist.create()
  bind(MongoDBBoundWitnessArchivist).toConstantValue(mongoDBBoundWitnessArchivist)
  bind<BoundWitnessArchivist>(TYPES.BoundWitnessArchivist).toService(MongoDBBoundWitnessArchivist)
  bind<AbstractModule>(TYPES.Module).toService(MongoDBBoundWitnessArchivist)

  const mongoDBPayloadArchivist = await MongoDBPayloadArchivist.create()
  bind(MongoDBPayloadArchivist).toConstantValue(mongoDBPayloadArchivist)
  bind<PayloadArchivist>(TYPES.PayloadArchivist).toService(MongoDBPayloadArchivist)
  bind<AbstractModule>(TYPES.Module).toService(MongoDBPayloadArchivist)

  bind(MongoDBUserArchivist).toConstantValue(new MongoDBUserArchivist())
  bind<UserArchivist>(TYPES.UserArchivist).toService(MongoDBUserArchivist)

  const mongoDBArchivistWitnessedPayloadArchivist = await MongoDBArchivistWitnessedPayloadArchivist.create()
  bind(MongoDBArchivistWitnessedPayloadArchivist).toConstantValue(mongoDBArchivistWitnessedPayloadArchivist)
  bind<WitnessedPayloadArchivist>(TYPES.WitnessedPayloadArchivist).toService(MongoDBArchivistWitnessedPayloadArchivist)
  bind<AbstractModule>(TYPES.Module).toService(MongoDBArchivistWitnessedPayloadArchivist)
})
