import type { ObjectTypeShape, TypeCheck } from '@xylabs/object'
import { IsObjectFactory } from '@xylabs/object'
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
