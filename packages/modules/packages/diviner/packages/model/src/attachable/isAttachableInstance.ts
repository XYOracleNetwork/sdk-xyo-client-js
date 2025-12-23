import type { ObjectTypeShape, TypeCheck } from '@xylabs/sdk-js'
import { IsObjectFactory } from '@xylabs/sdk-js'
import { isAttachableModuleInstance } from '@xyo-network/module-model'

import { isDivinerInstance } from '../typeChecks.ts'
import type { AttachableDivinerInstance } from './AttachableInstance.ts'

export const requiredAttachableDivinerInstanceFunctions: ObjectTypeShape = {}

// we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsObjectFactory<AttachableDivinerInstance>()

export const isAttachableDivinerInstance: TypeCheck<AttachableDivinerInstance> = factory.create(requiredAttachableDivinerInstanceFunctions, [
  isDivinerInstance,
  isAttachableModuleInstance,
])
