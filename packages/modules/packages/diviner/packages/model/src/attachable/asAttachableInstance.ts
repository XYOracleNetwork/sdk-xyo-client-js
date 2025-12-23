import { AsObjectFactory } from '@xylabs/sdk-js'

import { isAttachableDivinerInstance } from './isAttachableInstance.ts'

export const asAttachableDivinerInstance = AsObjectFactory.create(isAttachableDivinerInstance)
