import { DivinerConfig } from '@xyo-network/diviner-model'

export const HashLeaseEstimateDivinerConfigSchema = 'network.xyo.diviner.hash.lease.estimate.config' as const
export type HashLeaseEstimateDivinerConfigSchema = typeof HashLeaseEstimateDivinerConfigSchema

export type HashLeaseEstimateDivinerConfig = DivinerConfig<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {
    //
  },
  HashLeaseEstimateDivinerConfigSchema
>
