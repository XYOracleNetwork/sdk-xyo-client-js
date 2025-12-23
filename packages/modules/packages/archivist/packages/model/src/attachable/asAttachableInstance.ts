import { AsObjectFactory } from '@xylabs/sdk-js'

import { isAttachableArchivistInstance } from './isAttachableInstance.ts'

export const asAttachableArchivistInstance = AsObjectFactory.create(isAttachableArchivistInstance)
