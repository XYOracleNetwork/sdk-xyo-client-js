import { AbstractArchivist } from '@xyo-network/archivist'
import { AbstractModule } from '@xyo-network/module'
import { ArchiveArchivist, ArchiveKeyRepository, ArchiveModuleConfigSchema, UserArchivist } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { AsyncContainerModule, interfaces } from 'inversify'

import { MongoDBArchiveArchivist } from './Archive'
import { MongoDBArchiveKeyRepository } from './ArchiveKey'
import { MongoDBDeterministicArchivist } from './Deterministic'
import { MongoDBUserArchivist } from './User'

export const ArchivistContainerModule = new AsyncContainerModule(async (bind: interfaces.Bind) => {
  bind(MongoDBArchiveArchivist).toConstantValue(new MongoDBArchiveArchivist())
  bind<ArchiveArchivist>(TYPES.ArchiveArchivist).toService(MongoDBArchiveArchivist)

  bind(MongoDBArchiveKeyRepository).toConstantValue(new MongoDBArchiveKeyRepository())
  bind<ArchiveKeyRepository>(TYPES.ArchiveKeyRepository).toService(MongoDBArchiveKeyRepository)

  bind(MongoDBUserArchivist).toConstantValue(new MongoDBUserArchivist())
  bind<UserArchivist>(TYPES.UserArchivist).toService(MongoDBUserArchivist)

  const archivist = await MongoDBDeterministicArchivist.create({
    config: { name: TYPES.Archivist.description, schema: ArchiveModuleConfigSchema },
  })
  bind(MongoDBDeterministicArchivist).toConstantValue(archivist)
  bind<AbstractArchivist>(TYPES.Archivist).toService(MongoDBDeterministicArchivist)
  bind<AbstractModule>(TYPES.Module).toService(MongoDBDeterministicArchivist)
})
