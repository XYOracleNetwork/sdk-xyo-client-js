import { AsObjectFactory } from '@xylabs/object'

import { isAttachableArchivistInstance } from './isAttachableInstance.js'

export const asAttachableArchivistInstance = AsObjectFactory.create(isAttachableArchivistInstance)
