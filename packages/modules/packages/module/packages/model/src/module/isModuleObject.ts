import { IsObjectFactory, ObjectTypeShape } from '@xylabs/object'

import { Module } from './Module'

export const requiredModuleShape: ObjectTypeShape = {
  address: 'string',
  queries: 'array',
  query: 'function',
}

const factory = new IsObjectFactory<Module>()

export const isModuleObject = factory.create(requiredModuleShape)
