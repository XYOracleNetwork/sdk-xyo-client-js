import { AsObjectFactory } from '@xylabs/object'
import type { WithStorageMeta } from '@xyo-network/payload-model'
import {
  isPayloadOfSchemaType, isStorageMeta, notPayloadOfSchemaType,
} from '@xyo-network/payload-model'

import type {
  BoundWitness, Signed, UnsignedBoundWitness,
} from './BoundWitness/index.ts'
import { BoundWitnessSchema } from './BoundWitness/index.ts'

export const isBoundWitness = (value: unknown): value is BoundWitness => isPayloadOfSchemaType<BoundWitness>(BoundWitnessSchema)(value)

export const notBoundWitness = notPayloadOfSchemaType<BoundWitness>(BoundWitnessSchema)

// TODO: Use AsObjectFactory here to match standard pattern
// TODO: Other as identity functions throw if not valid, this one returns undefined with is more of a asOptional behavior
export const asBoundWitness = <T extends BoundWitness<{ schema: string }> = BoundWitness>(payload?: unknown) =>
  isBoundWitness(payload) ? (payload as T) : undefined

export const asOptionalBoundWitness = AsObjectFactory.createOptional<BoundWitness>(isBoundWitness)

export const isBoundWitnessWithStorageMeta = (value: unknown): value is WithStorageMeta<BoundWitness> =>
  isPayloadOfSchemaType<BoundWitness>(BoundWitnessSchema)(value) && isStorageMeta(value)
export const asBoundWitnessWithStorageMeta = AsObjectFactory.createOptional<WithStorageMeta<BoundWitness>>(isBoundWitnessWithStorageMeta)
export const asOptionalBoundWitnessWithStorageMeta = AsObjectFactory.createOptional<WithStorageMeta<BoundWitness>>(isBoundWitnessWithStorageMeta)

export const isSigned = (value: unknown): value is Signed =>
  isBoundWitness(value)
  && value.$signatures.length === value.addresses.length
  && value.addresses.length > 0

export const isUnsigned = (value: unknown): value is UnsignedBoundWitness =>
  isBoundWitness(value) && !isSigned(value)
