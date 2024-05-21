import { Payload } from '@xyo-network/payload-model'

export const HashLeaseSchema = 'network.xyo.hash.lease' as const
export type HashLeaseSchema = typeof HashLeaseSchema

export type HashLease = Payload<
  {
    /**
     * The desired duration of the lease
     */
    duration: number
  },
  HashLeaseSchema
>
