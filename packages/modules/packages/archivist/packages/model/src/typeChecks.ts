import { AsObjectFactory } from '@xylabs/object'
import {
  IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory,
} from '@xyo-network/module-model'

import { ArchivistInstance } from './Instance.ts'
import { ArchivistModuleInstance } from './ModuleInstance.ts'
import { ArchivistGetQuerySchema } from './Queries/index.ts'

export const isArchivistInstance = new IsInstanceFactory<ArchivistInstance>().create({ get: 'function' }, [isModuleInstance])
export const isArchivistModule = new IsModuleFactory<ArchivistModuleInstance>().create([ArchivistGetQuerySchema])

export const asArchivistModule = AsObjectFactory.create(isArchivistModule)
export const asArchivistInstance = AsObjectFactory.create(isArchivistInstance)
export const withArchivistModule = WithFactory.create(isArchivistModule)
export const withArchivistInstance = WithFactory.create(isArchivistInstance)
