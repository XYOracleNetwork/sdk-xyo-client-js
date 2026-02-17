import type { TypeCheck } from '@xylabs/sdk-js'
import type { Schema } from '@xyo-network/payload-model'

import { ModuleStateQuerySchema } from '../Queries/index.ts'
import { IsQueryableModuleFactory } from './IsQueryableModuleFactory.ts'
import { isQueryableModuleObject } from './isQueryableModuleObject.ts'
import type { QueryableModule } from './QueryableModule.ts'

export const requiredQueryableModuleQueries: Schema[] = [ModuleStateQuerySchema]

/** @deprecated use requiredQueryableModuleQueries instead */
export const requiredModuleQueries: Schema[] = requiredQueryableModuleQueries

// we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsQueryableModuleFactory<QueryableModule>()

export const isQueryableModule: TypeCheck<QueryableModule> = factory.create(requiredQueryableModuleQueries, [isQueryableModuleObject])

/** @deprecated use isQueryableModule instead */
export const isModule: TypeCheck<QueryableModule> = isQueryableModule
