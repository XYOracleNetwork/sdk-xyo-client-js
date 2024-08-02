import { AsObjectFactory } from '@xylabs/object'

import { isAttachableBridgeInstance } from './isAttachableInstance.ts'

export const asAttachableBridgeInstance = AsObjectFactory.create(isAttachableBridgeInstance)
