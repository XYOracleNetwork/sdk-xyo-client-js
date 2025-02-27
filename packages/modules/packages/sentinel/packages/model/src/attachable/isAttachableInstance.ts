import type { TypeCheck } from '@xylabs/object'
import { IsObjectFactory } from '@xylabs/object'
import type { ObjectTypeShape } from '@xylabs/typeof'
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
