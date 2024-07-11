import { AsObjectFactory } from '@xylabs/object'

import { isAttachableModuleInstance } from './isAttachableInstance.js'

export const asAttachableModuleInstance = AsObjectFactory.create(isAttachableModuleInstance)
