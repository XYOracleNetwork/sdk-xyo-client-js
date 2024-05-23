import { IsObjectFactory, ObjectTypeShape, TypeCheck } from '@xylabs/object'
import { isAttachableModuleInstance } from '@xyo-network/module-model'

import { isWitnessInstance } from '../typeChecks'
import { AttachableWitnessInstance } from './AttachableInstance'

export const requiredAttachableWitnessInstanceFunctions: ObjectTypeShape = {}

//we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsObjectFactory<AttachableWitnessInstance>()

export const isAttachableWitnessInstance: TypeCheck<AttachableWitnessInstance> = factory.create(requiredAttachableWitnessInstanceFunctions, [
  isWitnessInstance,
  isAttachableModuleInstance,
])
