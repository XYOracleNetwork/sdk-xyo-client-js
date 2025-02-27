import type { TypeCheck } from '@xylabs/object'
import { IsObjectFactory } from '@xylabs/object'
import type { ObjectTypeShape } from '@xylabs/typeof'

import { isModuleInstance } from '../isModuleInstance.ts'
import type { AttachableModuleInstance } from './AttachableInstance.ts'

export const requiredAttachableModuleInstanceFunctions: ObjectTypeShape = {
  downResolver: 'object',
  upResolver: 'object',
}

// we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsObjectFactory<AttachableModuleInstance>()

export const isAttachableModuleInstance: TypeCheck<AttachableModuleInstance> = factory.create(requiredAttachableModuleInstanceFunctions, [
  isModuleInstance,
])
