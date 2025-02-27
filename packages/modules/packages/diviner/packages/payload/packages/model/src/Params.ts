import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { PayloadDivinerConfig } from './Config.ts'

export type PayloadDivinerParams<T extends AnyConfigSchema<PayloadDivinerConfig> | void = void> = DivinerParams<
  T extends AnyConfigSchema<PayloadDivinerConfig> ? T : AnyConfigSchema<PayloadDivinerConfig>
>
