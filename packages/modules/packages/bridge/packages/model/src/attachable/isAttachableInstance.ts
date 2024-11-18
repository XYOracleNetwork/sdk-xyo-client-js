import type { TypeCheck } from '@xylabs/object'
import { IsObjectFactory } from '@xylabs/object'
import type { ObjectTypeShape } from '@xylabs/typeof'
import { isAttachableModuleInstance } from '@xyo-network/module-model'

import { isBridgeInstance } from '../typeChecks.ts'
import type { AttachableBridgeInstance } from './AttachableInstance.ts'

export const requiredAttachableBridgeInstanceFunctions: ObjectTypeShape = {}

// we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsObjectFactory<AttachableBridgeInstance>()

export const isAttachableBridgeInstance: TypeCheck<AttachableBridgeInstance> = factory.create(requiredAttachableBridgeInstanceFunctions, [
  isBridgeInstance,
  isAttachableModuleInstance,
])
