import { WithModuleFactory } from '@xyo-network/module-model'

import { isNodeModule } from './isNodeModule'

export const withNodeModule = WithModuleFactory.create(isNodeModule)
