import {
  AddressZod, HashZod, HexZod,
} from '@xylabs/sdk-js'
import {
  PayloadZod, SchemaZod, StorageMetaZod,
} from '@xyo-network/payload-model'
import * as z from 'zod'

import { BoundWitnessSchema } from './BoundWitnessSchema.ts'

const BoundWitnessRequiredFieldsZod = z.object({
  addresses: z.array(AddressZod),
  payload_hashes: z.array(HashZod),
  payload_schemas: z.array(SchemaZod),
  previous_hashes: z.array(HashZod.nullable()),
})

const BoundWitnessMetaZod = z.object({
  $destination: AddressZod.optional(),
  $sourceQuery: HashZod.optional(),
  $signatures: z.array(z.union([HexZod, z.null()])),
})

export const BoundWitnessZod = PayloadZod
  .extend({ schema: z.literal(BoundWitnessSchema) })
  .extend(BoundWitnessRequiredFieldsZod.shape)
  .extend(BoundWitnessMetaZod.shape)
  .refine(data => data.$signatures.length === data.addresses.length, { message: '$signatures length must equal addresses length' })

export type BoundWitness = z.infer<typeof BoundWitnessZod>

export const AnyBoundWitnessZod = BoundWitnessZod
  .catchall(z.any())

export type AnyBoundWitness = z.infer<typeof AnyBoundWitnessZod>

export const UnsignedBoundWitnessZod = BoundWitnessZod.refine(data => data.$signatures.includes(null), { message: 'all $signatures must be null' })

export type UnsignedBoundWitness = z.infer<typeof UnsignedBoundWitnessZod>

export const AnyUnsignedBoundWitnessZod = UnsignedBoundWitnessZod
  .catchall(z.any())

export type AnyUnsignedBoundWitness = z.infer<typeof AnyUnsignedBoundWitnessZod>

export const UnsignedBoundWitnessWithStorageMetaZod = UnsignedBoundWitnessZod
  .safeExtend(BoundWitnessRequiredFieldsZod.shape)
  .safeExtend(BoundWitnessMetaZod.shape)
  .safeExtend(StorageMetaZod.shape)

export const SignedZod = z.object({ $signatures: z.array(HexZod) })
export const UnsignedZod = z.object({ $signatures: z.array(z.null()) })

export const SignedBoundWitnessZod = BoundWitnessZod.refine(data => !data.$signatures.includes(null), { message: 'all $signatures must not be null' })

export const SignedBoundWitnessWithStorageMetaZod = UnsignedBoundWitnessWithStorageMetaZod

export const AnySignedBoundWitnessZod = UnsignedBoundWitnessZod.catchall(z.any())

export const AnySignedBoundWitnessWithStorageMetaZod = UnsignedBoundWitnessWithStorageMetaZod.catchall(z.any())

export type Unsigned<T extends UnsignedBoundWitness = UnsignedBoundWitness> = T & z.infer<typeof UnsignedZod>

export type Signed<T extends UnsignedBoundWitness = UnsignedBoundWitness> = T & z.infer<typeof SignedZod>
