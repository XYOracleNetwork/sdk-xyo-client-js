import { AsObjectFactory } from '@xylabs/object'

import { isAttachableDivinerInstance } from './isAttachableInstance.js'

export const asAttachableDivinerInstance = AsObjectFactory.create(isAttachableDivinerInstance)
