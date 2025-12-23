import { AsObjectFactory } from '@xylabs/sdk-js'

import { isAttachableWitnessInstance } from './isAttachableInstance.ts'

export const asAttachableWitnessInstance = AsObjectFactory.create(isAttachableWitnessInstance)
