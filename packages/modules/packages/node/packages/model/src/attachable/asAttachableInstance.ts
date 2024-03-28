import { AsObjectFactory } from '@xylabs/object'

import { isAttachableNodeInstance } from './isAttachableInstance'

export const asAttachableNodeInstance = AsObjectFactory.create(isAttachableNodeInstance)
