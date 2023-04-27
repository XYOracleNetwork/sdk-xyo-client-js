import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { PayloadStatsDivinerConfig } from './Config'

export type PayloadStatsDivinerParams = DivinerParams<AnyConfigSchema<PayloadStatsDivinerConfig>>
