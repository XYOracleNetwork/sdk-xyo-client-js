import { IsObjectFactory, ObjectTypeShape, TypeCheck } from '@xylabs/object'
import { isAttachableModuleInstance } from '@xyo-network/module-model'

import { isDivinerInstance } from '../typeChecks'
import { AttachableDivinerInstance } from './AttachableInstance'

export const requiredAttachableDivinerInstanceFunctions: ObjectTypeShape = {}

//we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsObjectFactory<AttachableDivinerInstance>()

export const isAttachableDivinerInstance: TypeCheck<AttachableDivinerInstance> = factory.create(requiredAttachableDivinerInstanceFunctions, [
  isDivinerInstance,
  isAttachableModuleInstance,
])
