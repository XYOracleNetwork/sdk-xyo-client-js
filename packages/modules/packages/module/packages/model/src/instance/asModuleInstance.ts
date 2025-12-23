import { AsObjectFactory } from '@xylabs/sdk-js'

import { isModuleInstance } from './isModuleInstance.ts'

export const asModuleInstance = AsObjectFactory.create(isModuleInstance)
