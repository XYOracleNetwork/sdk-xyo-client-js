import type { WithStorageMeta } from '@xyo-network/payload-model'
import {
  isPayloadOfSchemaType, isStorageMeta, notPayloadOfSchemaType,
} from '@xyo-network/payload-model'

import type { BoundWitness, UnsignedBoundWitness } from './BoundWitness/index.ts'
import { BoundWitnessSchema } from './BoundWitness/index.ts'

export const isBoundWitness = (value: unknown): value is BoundWitness => isPayloadOfSchemaType<BoundWitness>(BoundWitnessSchema)(value)
export const isBoundWitnessWithStorageMeta = (value: unknown): value is WithStorageMeta<BoundWitness> =>
  isPayloadOfSchemaType<BoundWitness>(BoundWitnessSchema)(value) && isStorageMeta(value)

export const isUnsignedBoundWitness = (value: unknown): value is UnsignedBoundWitness =>
  isPayloadOfSchemaType<UnsignedBoundWitness>(BoundWitnessSchema)(value)
export const notBoundWitness = notPayloadOfSchemaType<BoundWitness>(BoundWitnessSchema)

export const asBoundWitness = <T extends BoundWitness<{ schema: string }> = BoundWitness>(payload?: unknown) =>
  isBoundWitness(payload) ? (payload as T) : undefined

/** @deprecated use isBoundWitness instead */
export const isBoundWitnessPayload = isBoundWitness
