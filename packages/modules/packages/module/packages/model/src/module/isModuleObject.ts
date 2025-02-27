import { IsObjectFactory } from '@xylabs/object'
import { ObjectTypeShape } from '@xylabs/typeof'

import { Module } from './Module.ts'

export const requiredModuleShape: ObjectTypeShape = {
  address: 'string',
  queries: 'array',
  query: 'function',
}

const factory = new IsObjectFactory<Module>()

export const isModuleObject = factory.create(requiredModuleShape)
