import type { ObjectTypeShape } from '@xylabs/object'
import { IsObjectFactory } from '@xylabs/object'

import type { Module } from './Module.ts'

export const requiredModuleShape: ObjectTypeShape = {
  address: 'string',
  queries: 'array',
  query: 'function',
}

const factory = new IsObjectFactory<Module>()

export const isModuleObject = factory.create(requiredModuleShape)
