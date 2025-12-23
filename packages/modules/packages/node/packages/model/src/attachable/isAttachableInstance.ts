import type { ObjectTypeShape, TypeCheck } from '@xylabs/sdk-js'
import { IsObjectFactory } from '@xylabs/sdk-js'
import { isAttachableModuleInstance } from '@xyo-network/module-model'

import { isNodeInstance } from '../typeChecks.ts'
import type { AttachableNodeInstance } from './AttachableInstance.ts'

export const requiredAttachableNodeInstanceFunctions: ObjectTypeShape = {}

// we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsObjectFactory<AttachableNodeInstance>()

export const isAttachableNodeInstance: TypeCheck<AttachableNodeInstance> = factory.create(requiredAttachableNodeInstanceFunctions, [
  isNodeInstance,
  isAttachableModuleInstance,
])
