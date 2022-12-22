import { PartialModuleConfig } from '@xyo-network/module'

import { DivinerConfig } from './Config'

export type PartialDivinerConfig<T extends DivinerConfig> = PartialModuleConfig<T>
