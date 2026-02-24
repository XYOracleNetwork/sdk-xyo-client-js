import {
  AddressZod, HashZod,
  zodAsFactory, zodIsFactory, zodToFactory,
} from '@xylabs/sdk-js'
import { PayloadZod, SchemaZod } from '@xyo-network/payload-model'
import z from 'zod'

import { BoundWitnessSchema } from './BoundWitnessSchema.ts'
import type { SignedSignaturesMeta, UnsignedSignaturesMeta } from './Signatures.ts'
import { SignaturesMetaZod } from './Signatures.ts'

export const BoundWitnessRequiredFieldsZod = z.object({
  addresses: z.array(AddressZod),
  payload_hashes: z.array(HashZod),
  payload_schemas: z.array(SchemaZod),
  previous_hashes: z.array(HashZod.nullable()),
})

export type BoundWitnessRequiredFields = z.infer<typeof BoundWitnessRequiredFieldsZod>

export const BoundWitnessMetaZod = z.object({
  $destination: AddressZod.optional(),
  $sourceQuery: HashZod.optional(),
}).extend(SignaturesMetaZod.shape)

export type BoundWitnessMeta = z.infer<typeof BoundWitnessMetaZod>

export const BoundWitnessZod = PayloadZod
  .safeExtend({ schema: z.literal(BoundWitnessSchema) })
  .safeExtend(BoundWitnessRequiredFieldsZod.shape)
  .safeExtend(BoundWitnessMetaZod.shape)
  // .refine(data => data.$signatures.length === data.addresses.length, { message: '$signatures length must equal addresses length' })

export type BoundWitness = z.infer<typeof BoundWitnessZod>

export const isBoundWitness = zodIsFactory(BoundWitnessZod)
export const asBoundWitness = zodAsFactory(BoundWitnessZod, 'asBoundWitness')
export const toBoundWitness = zodToFactory(BoundWitnessZod, 'toBoundWitness')

export const AnyBoundWitnessZod = BoundWitnessZod.loose()
export type AnyBoundWitness = z.infer<typeof AnyBoundWitnessZod>

export type Unsigned<T extends BoundWitness> = Omit<T, '$signatures'> & UnsignedSignaturesMeta

export type Signed<T extends BoundWitness> = Omit<T, '$signatures'> & SignedSignaturesMeta

export type PossiblySigned<T extends BoundWitness> = Unsigned<T> | Signed<T>
