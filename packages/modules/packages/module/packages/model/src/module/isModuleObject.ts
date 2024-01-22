import { IsObjectFactory, ObjectTypeShape } from '@xylabs/object'

import { Module } from './Module'

export const requiredModuleShape: ObjectTypeShape = {
  address: 'string',
  config: 'object',
  params: 'object',
  queries: 'array',
  query: 'function',
  queryable: 'function',
}

const factory = new IsObjectFactory<Module>()

export const isModuleObject = factory.create(requiredModuleShape)
