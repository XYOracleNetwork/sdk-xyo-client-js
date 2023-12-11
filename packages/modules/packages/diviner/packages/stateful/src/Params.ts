import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { StatefulDivinerConfig } from './Config'

export type StatefulDivinerParams = DivinerParams<AnyConfigSchema<StatefulDivinerConfig>>
