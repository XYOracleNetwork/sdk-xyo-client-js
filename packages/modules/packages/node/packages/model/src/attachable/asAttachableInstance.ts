import { AsObjectFactory } from '@xylabs/object'

import { isAttachableNodeInstance } from './isAttachableInstance.ts'

export const asAttachableNodeInstance = AsObjectFactory.create(isAttachableNodeInstance)
