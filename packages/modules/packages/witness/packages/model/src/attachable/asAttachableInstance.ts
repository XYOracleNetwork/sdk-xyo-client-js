import { AsObjectFactory } from '@xylabs/object'

import { isAttachableWitnessInstance } from './isAttachableInstance.ts'

export const asAttachableWitnessInstance = AsObjectFactory.create(isAttachableWitnessInstance)
