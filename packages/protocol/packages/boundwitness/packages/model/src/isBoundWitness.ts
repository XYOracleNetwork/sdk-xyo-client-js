import type { WithMeta } from '@xyo-network/payload-model'
import {
  isPayloadOfSchemaType, isPayloadOfSchemaTypeWithMeta, notPayloadOfSchemaType,
} from '@xyo-network/payload-model'

import type { BoundWitness } from './BoundWitness/index.ts'
import { BoundWitnessSchema } from './BoundWitness/index.ts'

export const isBoundWitness = (value: unknown): value is BoundWitness => isPayloadOfSchemaType<BoundWitness>(BoundWitnessSchema)(value)
export const isBoundWitnessWithMeta = (value: unknown): value is WithMeta<BoundWitness> =>
  isPayloadOfSchemaTypeWithMeta<BoundWitness>(BoundWitnessSchema)(value)
export const notBoundWitness = notPayloadOfSchemaType<BoundWitness>(BoundWitnessSchema)

export const asBoundWitness = <T extends BoundWitness<{ schema: string }> = BoundWitness>(payload?: unknown) =>
  isBoundWitness(payload) ? (payload as T) : undefined

/** @deprecated use isBoundWitness instead */
export const isBoundWitnessPayload = isBoundWitness
