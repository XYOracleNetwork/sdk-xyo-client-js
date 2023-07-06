import { IsModuleFactory } from '@xyo-network/module-model'

import { BridgeModule } from './Bridge'
import { BridgeConnectQuerySchema, BridgeDisconnectQuerySchema } from './Queries'

export const isBridgeModule = IsModuleFactory.create<BridgeModule>([BridgeConnectQuerySchema, BridgeDisconnectQuerySchema])
