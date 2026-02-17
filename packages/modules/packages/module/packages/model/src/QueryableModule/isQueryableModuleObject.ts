import type { ObjectTypeShape, TypeCheck } from '@xylabs/sdk-js'
import { IsObjectFactory } from '@xylabs/sdk-js'

import type { QueryableModule } from './QueryableModule.ts'

export const requiredQueryableModuleShape: ObjectTypeShape = {
  address: 'string',
  queries: 'array',
  query: 'function',
}

/** @deprecated use requiredQueryableModuleShape instead */
export const requiredModuleShape: ObjectTypeShape = requiredQueryableModuleShape

const factory = new IsObjectFactory<QueryableModule>()

export const isQueryableModuleObject: TypeCheck<QueryableModule> = factory.create(requiredQueryableModuleShape)

/** @deprecated use isQueryableModuleObject instead */
export const isModuleObject: TypeCheck<QueryableModule> = isQueryableModuleObject
