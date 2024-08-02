import { AsObjectFactory } from '@xylabs/object'

import { isAttachableDivinerInstance } from './isAttachableInstance.ts'

export const asAttachableDivinerInstance = AsObjectFactory.create(isAttachableDivinerInstance)
