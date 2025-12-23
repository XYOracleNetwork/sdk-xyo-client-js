import { AsObjectFactory } from '@xylabs/sdk-js'

import { isModuleObject } from './isModuleObject.ts'

export const asModuleObject = AsObjectFactory.create(isModuleObject)
