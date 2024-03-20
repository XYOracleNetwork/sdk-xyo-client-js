import { DivinerConfig } from '@xyo-network/diviner-model'

export const HashLeaseEstimateDivinerConfigSchema = 'network.xyo.diviner.hash.lease.estimate.config'
export type HashLeaseEstimateDivinerConfigSchema = typeof HashLeaseEstimateDivinerConfigSchema

export type HashLeaseEstimateDivinerConfig = DivinerConfig<
  {
    //
  },
  HashLeaseEstimateDivinerConfigSchema
>
