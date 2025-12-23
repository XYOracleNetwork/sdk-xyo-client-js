import { AsObjectFactory } from '@xylabs/sdk-js'

import { isAttachableModuleInstance } from './isAttachableInstance.ts'

export const asAttachableModuleInstance = AsObjectFactory.create(isAttachableModuleInstance)
