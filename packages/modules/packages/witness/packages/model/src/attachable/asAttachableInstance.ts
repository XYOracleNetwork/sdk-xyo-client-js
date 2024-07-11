import { AsObjectFactory } from '@xylabs/object'

import { isAttachableWitnessInstance } from './isAttachableInstance.js'

export const asAttachableWitnessInstance = AsObjectFactory.create(isAttachableWitnessInstance)
