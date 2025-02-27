import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { BoundWitnessDivinerConfig } from './Config.ts'

export type BoundWitnessDivinerParams = DivinerParams<AnyConfigSchema<BoundWitnessDivinerConfig>>
