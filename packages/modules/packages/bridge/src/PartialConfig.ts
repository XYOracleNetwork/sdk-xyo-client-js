import { PartialModuleConfig } from '@xyo-network/module'

import { BridgeConfig } from './Config'

export type PartialBridgeConfig<T extends BridgeConfig> = PartialModuleConfig<T>
