import type z from 'zod'

import { BoundWitnessZod } from './BoundWitness.ts'
import { SignedSignaturesMetaZod } from './Signatures.ts'

export const SignedBoundWitnessZod = BoundWitnessZod.extend(SignedSignaturesMetaZod.shape)
export type SignedBoundWitness = z.infer<typeof SignedBoundWitnessZod>

export const AnySignedBoundWitnessZod = SignedBoundWitnessZod.loose()
export type AnySignedBoundWitness = z.infer<typeof AnySignedBoundWitnessZod>
