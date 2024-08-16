import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { StatefulDivinerConfig } from './Config.ts'

/**
 * The parameters for a Stateful Diviner
 */
export type StatefulDivinerParams = DivinerParams<AnyConfigSchema<StatefulDivinerConfig>>
