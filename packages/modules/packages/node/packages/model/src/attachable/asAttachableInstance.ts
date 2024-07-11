import { AsObjectFactory } from '@xylabs/object'

import { isAttachableNodeInstance } from './isAttachableInstance.js'

export const asAttachableNodeInstance = AsObjectFactory.create(isAttachableNodeInstance)
