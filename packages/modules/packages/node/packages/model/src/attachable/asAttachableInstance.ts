import { AsObjectFactory } from '@xylabs/sdk-js'

import { isAttachableNodeInstance } from './isAttachableInstance.ts'

export const asAttachableNodeInstance = AsObjectFactory.create(isAttachableNodeInstance)
