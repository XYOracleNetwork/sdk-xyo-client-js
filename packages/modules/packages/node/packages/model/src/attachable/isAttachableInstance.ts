import { IsObjectFactory, ObjectTypeShape, TypeCheck } from '@xylabs/object'
import { isAttachableModuleInstance } from '@xyo-network/module-model'

import { isNodeInstance } from '../typeChecks'
import { AttachableNodeInstance } from './AttachableInstance'

export const requiredAttachableNodeInstanceFunctions: ObjectTypeShape = {}

//we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsObjectFactory<AttachableNodeInstance>()

export const isAttachableNodeInstance: TypeCheck<AttachableNodeInstance> = factory.create(requiredAttachableNodeInstanceFunctions, [
  isNodeInstance,
  isAttachableModuleInstance,
])
