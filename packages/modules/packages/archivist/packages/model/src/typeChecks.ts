import type { TypeCheck } from '@xylabs/sdk-js'
import { AsObjectFactory } from '@xylabs/sdk-js'
import {
  // eslint-disable-next-line sonarjs/deprecation
  IsInstanceFactory, isModuleInstance, IsQueryableModuleFactory, WithFactory,
} from '@xyo-network/module-model'

import type { ArchivistInstance } from './Instance.ts'
import type { ArchivistModuleInstance } from './ModuleInstance.ts'
import { ArchivistGetQuerySchema } from './Queries/index.ts'

export const isArchivistInstance: TypeCheck<ArchivistInstance> = new IsInstanceFactory<ArchivistInstance>().create({ get: 'function' }, [isModuleInstance])
export const isArchivistModule: TypeCheck<ArchivistModuleInstance> = new IsQueryableModuleFactory<ArchivistModuleInstance>().create([ArchivistGetQuerySchema])

export const asArchivistModule = AsObjectFactory.create(isArchivistModule)
export const asArchivistInstance = AsObjectFactory.create(isArchivistInstance)

/** @deprecated use narrowing instead [ if(is) ] */
// eslint-disable-next-line sonarjs/deprecation, @typescript-eslint/no-deprecated
export const withArchivistModule = WithFactory.create(isArchivistModule)
/** @deprecated use narrowing instead [ if(is) ] */
// eslint-disable-next-line sonarjs/deprecation, @typescript-eslint/no-deprecated
export const withArchivistInstance = WithFactory.create(isArchivistInstance)
