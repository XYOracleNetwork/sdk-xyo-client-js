import { AsObjectFactory } from '@xylabs/object'

import { isModuleObject } from './isModuleObject.js'

export const asModuleObject = AsObjectFactory.create(isModuleObject)
