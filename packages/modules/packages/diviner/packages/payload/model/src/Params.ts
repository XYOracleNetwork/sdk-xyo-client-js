import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { PayloadDivinerConfig } from './Config'

export type PayloadDivinerParams = DivinerParams<AnyConfigSchema<PayloadDivinerConfig>>
