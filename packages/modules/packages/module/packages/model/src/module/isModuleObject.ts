import type { ObjectTypeShape, TypeCheck } from '@xylabs/sdk-js'
import { IsObjectFactory } from '@xylabs/sdk-js'

import type { Module } from './Module.ts'

export const requiredModuleShape: ObjectTypeShape = {
  address: 'string',
  queries: 'array',
  query: 'function',
}

const factory = new IsObjectFactory<Module>()

export const isModuleObject: TypeCheck<Module> = factory.create(requiredModuleShape)
