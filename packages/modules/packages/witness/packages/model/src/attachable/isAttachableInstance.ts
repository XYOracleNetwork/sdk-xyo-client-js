import type { ObjectTypeShape, TypeCheck } from '@xylabs/sdk-js'
import { IsObjectFactory } from '@xylabs/sdk-js'
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
