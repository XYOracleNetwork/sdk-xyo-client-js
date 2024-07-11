import { IsObjectFactory, ObjectTypeShape, TypeCheck } from '@xylabs/object'
import { isAttachableModuleInstance } from '@xyo-network/module-model'

import { isBridgeInstance } from '../typeChecks.js'
import { AttachableBridgeInstance } from './AttachableInstance.js'

export const requiredAttachableBridgeInstanceFunctions: ObjectTypeShape = {}

//we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsObjectFactory<AttachableBridgeInstance>()

export const isAttachableBridgeInstance: TypeCheck<AttachableBridgeInstance> = factory.create(requiredAttachableBridgeInstanceFunctions, [
  isBridgeInstance,
  isAttachableModuleInstance,
])
