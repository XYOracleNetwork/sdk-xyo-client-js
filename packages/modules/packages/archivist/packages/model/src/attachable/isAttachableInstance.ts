import type { ObjectTypeShape, TypeCheck } from '@xylabs/sdk-js'
import { IsObjectFactory } from '@xylabs/sdk-js'
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
