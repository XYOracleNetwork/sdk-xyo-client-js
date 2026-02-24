import { PayloadZod } from '@xyo-network/payload-model'
import z from 'zod'

import { type BoundWitness, BoundWitnessZod } from './BoundWitness.ts'
import { SignedBoundWitnessZod } from './SignedBoundWitness.ts'
import { UnsignedBoundWitnessZod } from './UnsignedBoundWitness.ts'

export function HydratedBoundWitnessZodBuilder<T extends z.ZodType<BoundWitness>>(bwZod: T) {
  return z.tuple([bwZod, z.array(PayloadZod.loose())])
}

export const HydratedBoundWitnessZod = HydratedBoundWitnessZodBuilder(BoundWitnessZod)
// export type HydratedBoundWitness = z.infer<typeof HydratedBoundWitnessZod>

export const SignedHydratedBoundWitnessZod = HydratedBoundWitnessZodBuilder(SignedBoundWitnessZod)
// export type SignedHydratedBoundWitness = z.infer<typeof SignedHydratedBoundWitnessZod>

export const UnsignedHydratedBoundWitnessZod = HydratedBoundWitnessZodBuilder(UnsignedBoundWitnessZod)
// export type UnsignedHydratedBoundWitness = z.infer<typeof UnsignedHydratedBoundWitnessZod>
