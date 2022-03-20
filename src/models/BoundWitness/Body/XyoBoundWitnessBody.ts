import { XyoPayloadBody } from '../../Payload'

interface XyoBoundWitnessBody extends XyoPayloadBody {
  [key: string]: unknown
  addresses: string[]
  previous_hash?: string
  payload_hashes: string[]
  payload_schemas: string[]
  previous_hashes: (string | null)[]
}

export type { XyoBoundWitnessBody }
