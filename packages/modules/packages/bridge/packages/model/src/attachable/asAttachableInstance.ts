import { AsObjectFactory } from '@xylabs/object'

import { isAttachableBridgeInstance } from './isAttachableInstance'

export const asAttachableBridgeInstance = AsObjectFactory.create(isAttachableBridgeInstance)
