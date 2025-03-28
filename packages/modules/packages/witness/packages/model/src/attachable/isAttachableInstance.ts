import type { TypeCheck } from '@xylabs/object'
import { IsObjectFactory } from '@xylabs/object'
import type { ObjectTypeShape } from '@xylabs/typeof'
import { isAttachableModuleInstance } from '@xyo-network/module-model'

import { isWitnessInstance } from '../typeChecks.ts'
import type { AttachableWitnessInstance } from './AttachableInstance.ts'

export const requiredAttachableWitnessInstanceFunctions: ObjectTypeShape = {}

// we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsObjectFactory<AttachableWitnessInstance>()

export const isAttachableWitnessInstance: TypeCheck<AttachableWitnessInstance> = factory.create(requiredAttachableWitnessInstanceFunctions, [
  isWitnessInstance,
  isAttachableModuleInstance,
])
