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
import { ContainerModule, interfaces } from 'inversify'

import { MongoDBArchiveArchivist } from './Archive'
import { MongoDBArchiveKeyRepository } from './ArchiveKey'
import { MongoDBBoundWitnessArchivist } from './BoundWitness'
import { MongoDBPayloadArchivist } from './Payload'
import { MongoDBUserArchivist } from './User'
import { MongoDBArchivistWitnessedPayloadArchivist } from './WitnessedPayload'

export const ArchivistContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(MongoDBArchiveArchivist).toConstantValue(new MongoDBArchiveArchivist())
  bind<ArchiveArchivist>(TYPES.ArchiveArchivist).toService(MongoDBArchiveArchivist)

  bind(MongoDBArchiveKeyRepository).toConstantValue(new MongoDBArchiveKeyRepository())
  bind<ArchiveKeyRepository>(TYPES.ArchiveKeyRepository).toService(MongoDBArchiveKeyRepository)

  bind(MongoDBBoundWitnessArchivist).toConstantValue(new MongoDBBoundWitnessArchivist())
  bind<BoundWitnessArchivist>(TYPES.BoundWitnessArchivist).toService(MongoDBBoundWitnessArchivist)
  bind<AbstractModule>(TYPES.Module).toService(MongoDBBoundWitnessArchivist)

  bind(MongoDBPayloadArchivist).toConstantValue(new MongoDBPayloadArchivist())
  bind<PayloadArchivist>(TYPES.PayloadArchivist).toService(MongoDBPayloadArchivist)
  bind<AbstractModule>(TYPES.Module).toService(MongoDBPayloadArchivist)

  bind(MongoDBUserArchivist).toConstantValue(new MongoDBUserArchivist())
  bind<UserArchivist>(TYPES.UserArchivist).toService(MongoDBUserArchivist)

  bind(MongoDBArchivistWitnessedPayloadArchivist).toConstantValue(new MongoDBArchivistWitnessedPayloadArchivist())
  bind<WitnessedPayloadArchivist>(TYPES.WitnessedPayloadArchivist).toService(MongoDBArchivistWitnessedPayloadArchivist)
  bind<AbstractModule>(TYPES.Module).toService(MongoDBArchivistWitnessedPayloadArchivist)
})
