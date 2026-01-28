import { AsObjectFactory } from '@xylabs/sdk-js'
import type { Payload, WithSources } from '@xyo-network/payload-model'
import {
  asSchema, isPayloadOfSchemaType, isPayloadOfSchemaTypeWithSources,
} from '@xyo-network/payload-model'

export const HashLeaseSchema = asSchema('network.xyo.hash.lease', true)
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

/**
 * Identity function for HashLease payload
 */
export const isHashLease = isPayloadOfSchemaType<HashLease>(HashLeaseSchema)
export const asHashLease = AsObjectFactory.create<HashLease>(isHashLease)
export const asOptionalHashLease = AsObjectFactory.createOptional<HashLease>(isHashLease)

/**
 * Identity function for HashLease payload with sources
 */
export const isHashLeaseWithSources = isPayloadOfSchemaTypeWithSources<WithSources<HashLease>>(HashLeaseSchema)
export const asHashLeaseWithSources = AsObjectFactory.create<WithSources<HashLease>>(isHashLeaseWithSources)
export const asOptionalHashLeaseWithSources = AsObjectFactory.createOptional<WithSources<HashLease>>(isHashLeaseWithSources)
