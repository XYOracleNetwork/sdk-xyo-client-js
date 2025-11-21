import { HexZod } from '@xylabs/sdk-js'
import z from 'zod'

import type { BoundWitness } from './BoundWitness.ts'

export const SignaturesMetaZod = z.object({ $signatures: z.array(z.union([HexZod, z.null()])) })
export const UnsignedSignaturesMetaZod = z.object({ $signatures: z.array(z.null()) })
export const SignedSignaturesMetaZod = z.object({ $signatures: z.array(HexZod) })

export type SignaturesMeta = z.infer<typeof SignaturesMetaZod>
export type UnsignedSignaturesMeta = z.infer<typeof UnsignedSignaturesMetaZod>
export type SignedSignaturesMeta = z.infer<typeof SignedSignaturesMetaZod>

export type Unsigned<T extends BoundWitness = BoundWitness> = Omit<T, '$signatures'> & UnsignedSignaturesMeta
export type Signed<T extends BoundWitness = BoundWitness> = Omit<T, '$signatures'> & SignedSignaturesMeta
