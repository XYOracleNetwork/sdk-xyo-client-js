import { XyoPayload } from '@xyo-network/payload'

import { XyoBoundWitnessSchema } from './XyoBoundWitnessSchema'

export type XyoBoundWitnessFields = {
  _signatures: string[]
  addresses: string[]
  blockNumber?: number
  payload_hashes: string[]
  payload_schemas: string[]
  previous_hashes: (string | null)[]
  timestamp?: number
}

export type XyoBoundWitness<T extends XyoPayload | void = void> = XyoPayload<
  T extends XyoPayload ? XyoBoundWitnessFields & T : XyoBoundWitnessFields,
  T extends XyoPayload ? T['schema'] : XyoBoundWitnessSchema
>
