import { AsObjectFactory } from '@xylabs/object'
import {
  isPayloadOfSchemaType, isPayloadOfSchemaTypeWithSources, Payload, WithSources,
} from '@xyo-network/payload-model'

export const HashLeaseEstimateSchema = 'network.xyo.hash.lease.estimate' as const
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
export const asHashLeaseEstimate = AsObjectFactory.create<HashLeaseEstimate>(isHashLeaseEstimate)
export const asOptionalHashLeaseEstimate = AsObjectFactory.createOptional<HashLeaseEstimate>(isHashLeaseEstimate)

/**
 * Identity function for HashLeaseEstimate payload with sources
 */
export const isHashLeaseEstimateWithSources = isPayloadOfSchemaTypeWithSources<WithSources<HashLeaseEstimate>>(HashLeaseEstimateSchema)
export const asHashLeaseEstimateWithSources = AsObjectFactory.create<WithSources<HashLeaseEstimate>>(isHashLeaseEstimateWithSources)
export const asOptionalHashLeaseEstimateWithSources = AsObjectFactory.createOptional<WithSources<HashLeaseEstimate>>(isHashLeaseEstimateWithSources)
