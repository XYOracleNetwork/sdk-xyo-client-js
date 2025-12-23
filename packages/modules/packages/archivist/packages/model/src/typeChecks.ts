import type { TypeCheck } from '@xylabs/sdk-js'
import { AsObjectFactory } from '@xylabs/sdk-js'
import {
  IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory,
} from '@xyo-network/module-model'

import type { ArchivistInstance } from './Instance.ts'
import type { ArchivistModuleInstance } from './ModuleInstance.ts'
import { ArchivistGetQuerySchema } from './Queries/index.ts'

export const isArchivistInstance: TypeCheck<ArchivistInstance> = new IsInstanceFactory<ArchivistInstance>().create({ get: 'function' }, [isModuleInstance])
export const isArchivistModule: TypeCheck<ArchivistModuleInstance> = new IsModuleFactory<ArchivistModuleInstance>().create([ArchivistGetQuerySchema])

export const asArchivistModule = AsObjectFactory.create(isArchivistModule)
export const asArchivistInstance = AsObjectFactory.create(isArchivistInstance)
export const withArchivistModule = WithFactory.create(isArchivistModule)
export const withArchivistInstance = WithFactory.create(isArchivistInstance)
