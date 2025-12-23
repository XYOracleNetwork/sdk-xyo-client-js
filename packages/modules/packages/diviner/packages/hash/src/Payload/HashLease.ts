import { AsObjectFactory } from '@xylabs/sdk-js'
import type { Payload, WithSources } from '@xyo-network/payload-model'
import { isPayloadOfSchemaType, isPayloadOfSchemaTypeWithSources } from '@xyo-network/payload-model'

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
