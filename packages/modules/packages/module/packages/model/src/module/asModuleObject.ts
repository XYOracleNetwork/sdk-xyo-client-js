import { AsObjectFactory } from '@xylabs/object'

import { isModuleObject } from './isModuleObject.ts'

export const asModuleObject = AsObjectFactory.create(isModuleObject)
