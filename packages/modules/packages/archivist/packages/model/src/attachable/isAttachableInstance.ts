import { IsObjectFactory, ObjectTypeShape, TypeCheck } from '@xylabs/object'
import { isAttachableModuleInstance } from '@xyo-network/module-model'

import { isArchivistInstance } from '../typeChecks.ts'
import { AttachableArchivistInstance } from './AttachableInstance.ts'

export const requiredAttachableArchivistInstanceFunctions: ObjectTypeShape = {}

// we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsObjectFactory<AttachableArchivistInstance>()

export const isAttachableArchivistInstance: TypeCheck<AttachableArchivistInstance> = factory.create(requiredAttachableArchivistInstanceFunctions, [
  isArchivistInstance,
  isAttachableModuleInstance,
])
