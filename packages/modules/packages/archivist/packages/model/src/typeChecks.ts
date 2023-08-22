import { IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory } from '@xyo-network/module-model'
import { AsObjectFactory } from '@xyo-network/object-identity'

import { ArchivistModule } from './Archivist'
import { ArchivistInstance } from './ArchivistInstance'
import { ArchivistGetQuerySchema } from './Queries'

export const isArchivistInstance = new IsInstanceFactory<ArchivistInstance>().create({ get: 'function' }, [isModuleInstance])
export const isArchivistModule = new IsModuleFactory<ArchivistModule>().create([ArchivistGetQuerySchema])

export const asArchivistModule = AsObjectFactory.create(isArchivistModule)
export const asArchivistInstance = AsObjectFactory.create(isArchivistInstance)
export const withArchivistModule = WithFactory.create(isArchivistModule)
export const withArchivistInstance = WithFactory.create(isArchivistInstance)
