import { AsFactory, IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory } from '@xyo-network/module-model'

import { ArchivistInstance, ArchivistModule } from './Archivist'
import { ArchivistGetQuerySchema } from './Queries'

export const isArchivistInstance = IsInstanceFactory.create<ArchivistInstance>({ get: 'function' }, isModuleInstance)
export const isArchivistModule = IsModuleFactory.create<ArchivistModule>([ArchivistGetQuerySchema])

export const asArchivistModule = AsFactory.create(isArchivistModule)
export const asArchivistInstance = AsFactory.create(isArchivistInstance)
export const withArchivistModule = WithFactory.create(isArchivistModule)
export const withArchivistInstance = WithFactory.create(isArchivistInstance)
