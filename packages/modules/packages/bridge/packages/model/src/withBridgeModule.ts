import { WithFactory } from '@xyo-network/module-model'

import { isBridgeInstance } from './isBridgeInstance'
import { isBridgeModule } from './isBridgeModule'

export const withBridgeModule = WithFactory.create(isBridgeModule)
export const withBridgeInstance = WithFactory.create(isBridgeInstance)
