import { IsObjectFactory, ObjectTypeShape, TypeCheck } from '@xylabs/object'
import { isAttachableModuleInstance } from '@xyo-network/module-model'

import { isWitnessInstance } from '../typeChecks.js'
import { AttachableWitnessInstance } from './AttachableInstance.js'

export const requiredAttachableWitnessInstanceFunctions: ObjectTypeShape = {}

//we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsObjectFactory<AttachableWitnessInstance>()

export const isAttachableWitnessInstance: TypeCheck<AttachableWitnessInstance> = factory.create(requiredAttachableWitnessInstanceFunctions, [
  isWitnessInstance,
  isAttachableModuleInstance,
])
