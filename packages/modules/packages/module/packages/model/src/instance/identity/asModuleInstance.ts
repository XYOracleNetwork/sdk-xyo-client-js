import { AsObjectFactory } from '@xyo-network/object-identity'

import { isModuleInstance } from './isModuleInstance'

export const asModuleInstance = AsObjectFactory.create(isModuleInstance)
