import { AsObjectFactory } from '@xylabs/sdk-js'

import { isAttachableSentinelInstance } from './isAttachableInstance.ts'

export const asAttachableSentinelInstance = AsObjectFactory.create(isAttachableSentinelInstance)
