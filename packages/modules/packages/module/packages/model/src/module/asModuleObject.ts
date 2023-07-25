import { AsObjectFactory } from '@xyo-network/object-identity'

import { isModuleObject } from './isModuleObject'

export const asModuleObject = AsObjectFactory.create(isModuleObject)
