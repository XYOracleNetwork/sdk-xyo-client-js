import { AsObjectFactory } from '@xylabs/object'

import { isAttachableModuleInstance } from './isAttachableInstance'

export const asAttachableModuleInstance = AsObjectFactory.create(isAttachableModuleInstance)
