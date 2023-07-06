import { WithFactory } from '@xyo-network/module-model'

import { isNodeInstance } from './isNodeInstance'
import { isNodeModule } from './isNodeModule'

export const withNodeInstance = WithFactory.create(isNodeInstance)
export const withNodeModule = WithFactory.create(isNodeModule)
