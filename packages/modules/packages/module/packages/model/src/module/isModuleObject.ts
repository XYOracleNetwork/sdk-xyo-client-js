import { IsObjectFactory, ObjectTypeCheck, ObjectTypeShape } from '@xyo-network/object'

import { Module } from './Module'

export const requiredModuleFunctions: ObjectTypeShape = {
  address: 'string',
  config: 'object',
  params: 'object',
  queries: 'array',
  query: 'function',
  queryable: 'function',
}

const factory = new IsObjectFactory<Module>()

export const isModuleObject: ObjectTypeCheck<Module> = factory.create(requiredModuleFunctions)
