import type z from 'zod'

import { BoundWitnessZod } from './BoundWitness.ts'
import { UnsignedSignaturesMetaZod } from './Signatures.ts'

export const UnsignedBoundWitnessZod = BoundWitnessZod.extend(UnsignedSignaturesMetaZod.shape)
export type UnsignedBoundWitness = z.infer<typeof UnsignedBoundWitnessZod>

export const AnyUnsignedBoundWitnessZod = UnsignedBoundWitnessZod.loose()
export type AnyUnsignedBoundWitness = z.infer<typeof AnyUnsignedBoundWitnessZod>
