import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { BoundWitnessStatsDivinerConfig } from './Config.ts'

export type BoundWitnessStatsDivinerParams = DivinerParams<AnyConfigSchema<BoundWitnessStatsDivinerConfig>>
