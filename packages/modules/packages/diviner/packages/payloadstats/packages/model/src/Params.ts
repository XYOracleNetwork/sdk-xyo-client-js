import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { PayloadStatsDivinerConfig } from './Config.ts'

export type PayloadStatsDivinerParams = DivinerParams<AnyConfigSchema<PayloadStatsDivinerConfig>>
