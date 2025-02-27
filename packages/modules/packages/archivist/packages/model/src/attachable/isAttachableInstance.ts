import type { TypeCheck } from '@xylabs/object'
import { IsObjectFactory } from '@xylabs/object'
import type { ObjectTypeShape } from '@xylabs/typeof'
import { isAttachableModuleInstance } from '@xyo-network/module-model'

import { isArchivistInstance } from '../typeChecks.ts'
import type { AttachableArchivistInstance } from './AttachableInstance.ts'

export const requiredAttachableArchivistInstanceFunctions: ObjectTypeShape = {}

// we do not use IsInstanceFactory here to prevent a cycle
const factory = new IsObjectFactory<AttachableArchivistInstance>()

export const isAttachableArchivistInstance: TypeCheck<AttachableArchivistInstance> = factory.create(requiredAttachableArchivistInstanceFunctions, [
  isArchivistInstance,
  isAttachableModuleInstance,
])
