import { AsObjectFactory } from '@xylabs/object'

import { isModuleInstance } from './isModuleInstance.js'

export const asModuleInstance = AsObjectFactory.create(isModuleInstance)
