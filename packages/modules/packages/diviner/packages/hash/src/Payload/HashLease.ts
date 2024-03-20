import { Payload } from '@xyo-network/payload-model'

export const HashLeaseSchema = 'network.xyo.hash.lease'
export type HashLeaseSchema = typeof HashLeaseSchema

export type HashLease = Payload<
  {
    /**
     * The desired duration of the lease
     */
    duration: number
    /**
     * The absolute expiration time of the lease
     * @deprecated use duration instead
     */
    expire: number
  },
  HashLeaseSchema
>
