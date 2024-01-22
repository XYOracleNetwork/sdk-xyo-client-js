import { AsObjectFactory } from '@xylabs/object'

import { isModuleInstance } from './isModuleInstance'

export const asModuleInstance = AsObjectFactory.create(isModuleInstance)
