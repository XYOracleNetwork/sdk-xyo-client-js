import { XyoPayload } from '../../../models'

export type XyoBoundWitnessBase = XyoPayload<{
  addresses: string[]
  previous_hash?: string
  payload_hashes: string[]
  payload_schemas: string[]
  previous_hashes: (string | null)[]
  schema: string
}>
