import { AsObjectFactory } from '@xyo-network/object'

import { isModuleObject } from './isModuleObject'

export const asModuleObject = AsObjectFactory.create(isModuleObject)
