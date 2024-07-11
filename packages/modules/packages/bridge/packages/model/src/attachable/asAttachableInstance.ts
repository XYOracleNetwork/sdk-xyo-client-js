import { AsObjectFactory } from '@xylabs/object'

import { isAttachableBridgeInstance } from './isAttachableInstance.js'

export const asAttachableBridgeInstance = AsObjectFactory.create(isAttachableBridgeInstance)
