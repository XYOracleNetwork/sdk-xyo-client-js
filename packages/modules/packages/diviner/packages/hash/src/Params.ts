import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { HashLeaseEstimateDivinerConfig } from './Config.ts'

export type HashLeaseEstimateDivinerParams<
  TConfig extends AnyConfigSchema<HashLeaseEstimateDivinerConfig> = AnyConfigSchema<HashLeaseEstimateDivinerConfig>,
> = DivinerParams<TConfig>
