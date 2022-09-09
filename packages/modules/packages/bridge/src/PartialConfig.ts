import { PartialModuleConfig } from '@xyo-network/module'

import { XyoBridgeConfig } from './Config'

export type PartialBridgeConfig<T extends XyoBridgeConfig> = PartialModuleConfig<T>
