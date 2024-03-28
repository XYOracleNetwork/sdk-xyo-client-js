import { IsObjectFactory, ObjectTypeShape, TypeCheck } from '@xylabs/object'

import { isModuleInstance } from '../isModuleInstance'
import { AttachableModuleInstance } from './AttachableInstance'

export const requiredAttachableModuleInstanceFunctions: ObjectTypeShape = {
  downResolver: 'object',
  upResolver: 'object',
}

//we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsObjectFactory<AttachableModuleInstance>()

export const isAttachableModuleInstance: TypeCheck<AttachableModuleInstance> = factory.create(requiredAttachableModuleInstanceFunctions, [
  isModuleInstance,
])
