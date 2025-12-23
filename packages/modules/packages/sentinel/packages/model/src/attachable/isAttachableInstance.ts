import type { ObjectTypeShape, TypeCheck } from '@xylabs/sdk-js'
import { IsObjectFactory } from '@xylabs/sdk-js'
import { isAttachableModuleInstance } from '@xyo-network/module-model'

import { isSentinelInstance } from '../typeChecks.ts'
import type { AttachableSentinelInstance } from './AttachableInstance.ts'

export const requiredAttachableSentinelInstanceFunctions: ObjectTypeShape = {}

// we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsObjectFactory<AttachableSentinelInstance>()

export const isAttachableSentinelInstance: TypeCheck<AttachableSentinelInstance> = factory.create(requiredAttachableSentinelInstanceFunctions, [
  isSentinelInstance,
  isAttachableModuleInstance,
])
