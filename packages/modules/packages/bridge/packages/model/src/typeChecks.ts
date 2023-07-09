import { AsFactory, IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory } from '@xyo-network/module-model'

import { BridgeInstance, BridgeModule } from './Bridge'
import { BridgeConnectQuerySchema, BridgeDisconnectQuerySchema } from './Queries'

export const isBridgeInstance = IsInstanceFactory.create<BridgeInstance>(
  {
    connect: 'function',
    disconnect: 'function',
  },
  isModuleInstance,
)
export const isBridgeModule = IsModuleFactory.create<BridgeModule>([BridgeConnectQuerySchema, BridgeDisconnectQuerySchema])

export const asBridgeModule = AsFactory.create(isBridgeModule)
export const asBridgeInstance = AsFactory.create(isBridgeInstance)
export const withBridgeModule = WithFactory.create(isBridgeModule)
export const withBridgeInstance = WithFactory.create(isBridgeInstance)
