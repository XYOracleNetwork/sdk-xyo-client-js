import { isPayloadOfSchemaType, isPayloadOfSchemaTypeWithMeta, isPayloadOfSchemaTypeWithSources, Payload } from '@xyo-network/payload-model'

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

/**
 * Identity function for HashLeaseEstimate payload
 */
export const isHashLeaseEstimate = isPayloadOfSchemaType<HashLeaseEstimate>(HashLeaseEstimateSchema)

/**
 * Identity function for HashLeaseEstimate payload with meta
 */
export const isHashLeaseEstimateWithMeta = isPayloadOfSchemaTypeWithMeta<HashLeaseEstimate>(HashLeaseEstimateSchema)

/**
 * Identity function for HashLeaseEstimate payload with sources
 */
export const isHashLeaseEstimateWithSources = isPayloadOfSchemaTypeWithSources<HashLeaseEstimate>(HashLeaseEstimateSchema)
