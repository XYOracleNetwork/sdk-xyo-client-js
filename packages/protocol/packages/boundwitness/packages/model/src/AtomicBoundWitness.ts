import type { Hash } from '@xylabs/hex'
import { AsObjectFactory } from '@xylabs/object'
import type { Payload } from '@xyo-network/payload-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'

import type { BoundWitness } from './BoundWitness/index.ts'

// payload that wraps a complete boundwitness with its payloads for use in systems such as submission queues
export const AtomicBoundWitnessSchema = 'network.xyo.boundwitness.atomic' as const
export type AtomicBoundWitnessSchema = typeof AtomicBoundWitnessSchema

export interface AtomicBoundWitnessFields<TBoundWitness extends BoundWitness = BoundWitness> {
  bw: TBoundWitness
  payloads: Record<Hash, Payload>
}

export type AtomicBoundWitness = Payload<AtomicBoundWitnessFields, AtomicBoundWitnessSchema>

export const isAtomicBoundWitness = isPayloadOfSchemaType<AtomicBoundWitness>(AtomicBoundWitnessSchema)

export const asAtomicBoundWitness = AsObjectFactory.create(isAtomicBoundWitness)
export const asOptionalAtomicBoundWitness = AsObjectFactory.createOptional(isAtomicBoundWitness)
