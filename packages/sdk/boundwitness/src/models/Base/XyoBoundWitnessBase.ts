import { XyoPayload } from '@xyo-network/payload'

import { XyoBoundWitnessSchema } from '../XyoBoundWitnessSchema'

export type XyoBoundWitness = XyoPayload<{
  addresses: string[]
  previous_hash?: string
  payload_hashes: string[]
  payload_schemas: string[]
  previous_hashes: (string | null)[]
  schema: XyoBoundWitnessSchema
  _signatures: string[]
}>
