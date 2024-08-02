import { AsObjectFactory } from '@xylabs/object'

import { isAttachableArchivistInstance } from './isAttachableInstance.ts'

export const asAttachableArchivistInstance = AsObjectFactory.create(isAttachableArchivistInstance)
