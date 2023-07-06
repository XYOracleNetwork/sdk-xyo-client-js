import { WithModuleFactory } from '@xyo-network/module-model'

import { isBridgeModule } from './isBridgeModule'

export const withBridgeModule = WithModuleFactory.create(isBridgeModule)
