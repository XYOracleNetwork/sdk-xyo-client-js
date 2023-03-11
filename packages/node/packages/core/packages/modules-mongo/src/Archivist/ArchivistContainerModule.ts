import { AbstractArchivist } from '@xyo-network/archivist'
import { AbstractModule } from '@xyo-network/module'
import { ArchiveModuleConfigSchema, UserArchivist } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { AsyncContainerModule, interfaces } from 'inversify'

import { MongoDBDeterministicArchivist } from './Deterministic'
import { MongoDBUserArchivist } from './User'

export const ArchivistContainerModule = new AsyncContainerModule(async (bind: interfaces.Bind) => {
  bind(MongoDBUserArchivist).toConstantValue(new MongoDBUserArchivist())
  bind<UserArchivist>(TYPES.UserArchivist).toService(MongoDBUserArchivist)

  const archivist = (await MongoDBDeterministicArchivist.create({
    config: { name: TYPES.Archivist.description, schema: ArchiveModuleConfigSchema },
  })) as MongoDBDeterministicArchivist
  bind(MongoDBDeterministicArchivist).toConstantValue(archivist)
  bind<AbstractArchivist>(TYPES.Archivist).toService(MongoDBDeterministicArchivist)
  bind<AbstractModule>(TYPES.Module).toService(MongoDBDeterministicArchivist)
})
