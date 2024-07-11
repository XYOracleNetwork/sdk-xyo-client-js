import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { StatefulDivinerConfig } from './Config.js'

/**
 * The parameters for a Stateful Diviner
 */
export type StatefulDivinerParams = DivinerParams<AnyConfigSchema<StatefulDivinerConfig>>
