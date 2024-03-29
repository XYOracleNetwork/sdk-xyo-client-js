import { AsObjectFactory } from '@xylabs/object'

import { isAttachableDivinerInstance } from './isAttachableInstance'

export const asAttachableDivinerInstance = AsObjectFactory.create(isAttachableDivinerInstance)
