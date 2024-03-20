import { Payload } from '@xyo-network/payload-model'

export const HashLeaseEstimateSchema = 'network.xyo.hash.lease.estimate'
export type HashLeaseEstimateSchema = typeof HashLeaseEstimateSchema

export interface HashLeaseEstimateFields {
  /**
   * The currency of the price
   */
  currency: string
  /**
   * When the lease ends
   */
  exp: number
  /**
   * When the lease begins
   */
  nbf: number
  /**
   * The estimated price of the lease
   */
  price: number
}

export type HashLeaseEstimate = Payload<HashLeaseEstimateFields, HashLeaseEstimateSchema>
