import { AsObjectFactory } from '@xylabs/object'

import { isModuleObject } from './isModuleObject'

export const asModuleObject = AsObjectFactory.create(isModuleObject)
