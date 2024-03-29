import { AsObjectFactory } from '@xylabs/object'

import { isAttachableWitnessInstance } from './isAttachableInstance'

export const asAttachableWitnessInstance = AsObjectFactory.create(isAttachableWitnessInstance)
