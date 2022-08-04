import { XyoPayload } from '@xyo-network/payload'

export type XyoBoundWitness = XyoPayload<{
  addresses: string[]
  previous_hash?: string
  payload_hashes: string[]
  payload_schemas: string[]
  previous_hashes: (string | null)[]
  schema: string
  _signatures: string[]
}>
