import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { BoundWitnessDivinerConfig } from './Config'

export type BoundWitnessDivinerParams = DivinerParams<AnyConfigSchema<BoundWitnessDivinerConfig>>
