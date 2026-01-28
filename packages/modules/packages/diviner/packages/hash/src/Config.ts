import type { DivinerConfig } from '@xyo-network/diviner-model'
import { asSchema } from '@xyo-network/payload-model'

export const HashLeaseEstimateDivinerConfigSchema = asSchema('network.xyo.diviner.hash.lease.estimate.config', true)
export type HashLeaseEstimateDivinerConfigSchema = typeof HashLeaseEstimateDivinerConfigSchema

export type HashLeaseEstimateDivinerConfig = DivinerConfig<

  {
    //
  },
  HashLeaseEstimateDivinerConfigSchema
>
