import { HexZod } from '@xylabs/sdk-js'
import z from 'zod'

export const SignaturesMetaZod = z.object({ $signatures: z.array(z.union([HexZod, z.null()])) })
export const UnsignedSignaturesMetaZod = z.object({ $signatures: z.array(z.null()) })
export const SignedSignaturesMetaZod = z.object({ $signatures: z.array(HexZod).min(1) })

export type SignaturesMeta = z.infer<typeof SignaturesMetaZod>
export type UnsignedSignaturesMeta = z.infer<typeof UnsignedSignaturesMetaZod>
export type SignedSignaturesMeta = z.infer<typeof SignedSignaturesMetaZod>
