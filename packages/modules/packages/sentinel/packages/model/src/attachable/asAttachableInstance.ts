import { AsObjectFactory } from '@xylabs/object'

import { isAttachableSentinelInstance } from './isAttachableInstance.ts'

export const asAttachableSentinelInstance = AsObjectFactory.create(isAttachableSentinelInstance)
