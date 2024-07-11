import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { BoundWitnessStatsDivinerConfig } from './Config.js'

export type BoundWitnessStatsDivinerParams = DivinerParams<AnyConfigSchema<BoundWitnessStatsDivinerConfig>>
