import { PartialModuleConfig } from '@xyo-network/module'

import { NodeConfig } from './Config'

export type PartialNodeConfig<T extends NodeConfig = NodeConfig> = PartialModuleConfig<T>
