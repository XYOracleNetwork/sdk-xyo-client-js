import {
  ArchiveArchivist,
  ArchiveKeyArchivist,
  BoundWitnessesArchivist,
  PayloadArchivist,
  UserArchivist,
  WitnessedPayloadArchivist,
} from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { ContainerModule, interfaces } from 'inversify'

import { MongoDBArchiveArchivist } from './Archive'
import { MongoDBArchiveKeyArchivist } from './ArchiveKey'
import { MongoDBBoundWitnessArchivist } from './BoundWitness'
import { MongoDBPayloadArchivist } from './Payload'
import { MongoDBUserArchivist } from './User'
import { MongoDBArchivistWitnessedPayloadArchivist } from './WitnessedPayload'

export const ArchivistContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(MongoDBArchiveArchivist).to(MongoDBArchiveArchivist).inSingletonScope()
  bind<ArchiveArchivist>(TYPES.ArchiveArchivist).toService(MongoDBArchiveArchivist)

  bind(MongoDBArchiveKeyArchivist).to(MongoDBArchiveKeyArchivist).inSingletonScope()
  bind<ArchiveKeyArchivist>(TYPES.ArchiveKeyArchivist).toService(MongoDBArchiveKeyArchivist)

  bind(MongoDBBoundWitnessArchivist).to(MongoDBBoundWitnessArchivist).inSingletonScope()
  bind<BoundWitnessesArchivist>(TYPES.BoundWitnessArchivist).toService(MongoDBBoundWitnessArchivist)

  bind(MongoDBPayloadArchivist).to(MongoDBPayloadArchivist).inSingletonScope()
  bind<PayloadArchivist>(TYPES.PayloadArchivist).toService(MongoDBPayloadArchivist)

  bind(MongoDBUserArchivist).to(MongoDBUserArchivist).inSingletonScope()
  bind<UserArchivist>(TYPES.UserArchivist).toService(MongoDBUserArchivist)

  bind(MongoDBArchivistWitnessedPayloadArchivist).to(MongoDBArchivistWitnessedPayloadArchivist).inSingletonScope()
  bind<WitnessedPayloadArchivist>(TYPES.WitnessedPayloadArchivist).toService(MongoDBArchivistWitnessedPayloadArchivist)
})
