import { AsObjectFactory } from '@xylabs/object'
import {
  IsInstanceFactory, IsModuleFactory, isModuleInstance, WithFactory,
} from '@xyo-network/module-model'

import type { BridgeInstance } from './Instance.ts'
import type { BridgeModule } from './Module.ts'
import { BridgeConnectQuerySchema, BridgeDisconnectQuerySchema } from './Queries/index.ts'

export const isBridgeInstance = new IsInstanceFactory<BridgeInstance>().create(
  { expose: 'function' },
  [isModuleInstance],
)
export const isBridgeModule = new IsModuleFactory<BridgeModule>().create([BridgeConnectQuerySchema, BridgeDisconnectQuerySchema])

export const asBridgeModule = AsObjectFactory.create(isBridgeModule)
export const asBridgeInstance = AsObjectFactory.create(isBridgeInstance)
export const withBridgeModule = WithFactory.create(isBridgeModule)
export const withBridgeInstance = WithFactory.create(isBridgeInstance)
