import { AsObjectFactory } from '@xylabs/sdk-js'

import { isAttachableBridgeInstance } from './isAttachableInstance.ts'

export const asAttachableBridgeInstance = AsObjectFactory.create(isAttachableBridgeInstance)
