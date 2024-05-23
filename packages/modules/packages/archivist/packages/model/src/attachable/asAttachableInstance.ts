import { AsObjectFactory } from '@xylabs/object'

import { isAttachableArchivistInstance } from './isAttachableInstance'

export const asAttachableArchivistInstance = AsObjectFactory.create(isAttachableArchivistInstance)
