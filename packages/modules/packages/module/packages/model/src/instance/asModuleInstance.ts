import { AsObjectFactory } from '@xylabs/object'

import { isModuleInstance } from './isModuleInstance.ts'

export const asModuleInstance = AsObjectFactory.create(isModuleInstance)
