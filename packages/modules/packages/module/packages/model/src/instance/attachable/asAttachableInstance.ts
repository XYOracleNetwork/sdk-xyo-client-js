import { AsObjectFactory } from '@xylabs/object'

import { isAttachableModuleInstance } from './isAttachableInstance.ts'

export const asAttachableModuleInstance = AsObjectFactory.create(isAttachableModuleInstance)
