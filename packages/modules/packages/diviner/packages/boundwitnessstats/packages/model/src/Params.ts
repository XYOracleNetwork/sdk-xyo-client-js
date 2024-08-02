import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { BoundWitnessStatsDivinerConfig } from './Config.ts'

export type BoundWitnessStatsDivinerParams = DivinerParams<AnyConfigSchema<BoundWitnessStatsDivinerConfig>>
