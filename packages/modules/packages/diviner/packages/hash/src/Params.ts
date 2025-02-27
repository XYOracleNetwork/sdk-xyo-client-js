import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { HashLeaseEstimateDivinerConfig } from './Config.ts'

export type HashLeaseEstimateDivinerParams<
  TConfig extends AnyConfigSchema<HashLeaseEstimateDivinerConfig> = AnyConfigSchema<HashLeaseEstimateDivinerConfig>,
> = DivinerParams<TConfig>
