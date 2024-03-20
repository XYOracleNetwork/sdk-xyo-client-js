import { Payload } from '@xyo-network/payload-model'

export const HashLeaseSchema = 'network.xyo.hash.lease'
export type HashLeaseSchema = typeof HashLeaseSchema

export type HashLease = Payload<
  {
    expire: number
  },
  HashLeaseSchema
>
