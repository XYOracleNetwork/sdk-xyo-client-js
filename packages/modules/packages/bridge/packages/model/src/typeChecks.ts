import { IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory } from '@xyo-network/module-model'
import { AsObjectFactory } from '@xyo-network/object-identity'

import { BridgeInstance, BridgeModule } from './Bridge'
import { BridgeConnectQuerySchema, BridgeDisconnectQuerySchema } from './Queries'

export const isBridgeInstance = new IsInstanceFactory<BridgeInstance>().create(
  {
    connect: 'function',
    disconnect: 'function',
  },
  [isModuleInstance],
)
export const isBridgeModule = new IsModuleFactory<BridgeModule>().create([BridgeConnectQuerySchema, BridgeDisconnectQuerySchema])

export const asBridgeModule = AsObjectFactory.create(isBridgeModule)
export const asBridgeInstance = AsObjectFactory.create(isBridgeInstance)
export const withBridgeModule = WithFactory.create(isBridgeModule)
export const withBridgeInstance = WithFactory.create(isBridgeInstance)
