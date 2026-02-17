import { AsObjectFactory } from '@xylabs/sdk-js'
import {
  // eslint-disable-next-line sonarjs/deprecation
  IsInstanceFactory, isModuleInstance, IsQueryableModuleFactory, WithFactory,
} from '@xyo-network/module-model'

import type { BridgeInstance } from './Instance.ts'
import type { BridgeModule } from './Module.ts'
import { BridgeConnectQuerySchema, BridgeDisconnectQuerySchema } from './Queries/index.ts'

export const isBridgeInstance = new IsInstanceFactory<BridgeInstance>().create(
  { expose: 'function' },
  [isModuleInstance],
)
export const isBridgeModule = new IsQueryableModuleFactory<BridgeModule>().create([BridgeConnectQuerySchema, BridgeDisconnectQuerySchema])

export const asBridgeModule = AsObjectFactory.create(isBridgeModule)
export const asBridgeInstance = AsObjectFactory.create(isBridgeInstance)

/** @deprecated use narrowing instead [ if(is) ] */
// eslint-disable-next-line sonarjs/deprecation, @typescript-eslint/no-deprecated
export const withBridgeModule = WithFactory.create(isBridgeModule)
/** @deprecated use narrowing instead [ if(is) ] */
// eslint-disable-next-line sonarjs/deprecation, @typescript-eslint/no-deprecated
export const withBridgeInstance = WithFactory.create(isBridgeInstance)
