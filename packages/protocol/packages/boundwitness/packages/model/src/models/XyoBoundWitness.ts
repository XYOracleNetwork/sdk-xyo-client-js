import { Payload } from '@xyo-network/payload-model'

import { XyoBoundWitnessSchema } from './XyoBoundWitnessSchema'

export type BoundWitnessFields = {
  _signatures: string[]
  addresses: string[]
  blockNumber?: number
  payload_hashes: string[]
  payload_schemas: string[]
  previous_hashes: (string | null)[]
  timestamp?: number
}

export type XyoBoundWitnessFields = BoundWitnessFields

export type BoundWitness<T extends Payload | void = void> = Payload<
  T extends Payload ? XyoBoundWitnessFields & T : XyoBoundWitnessFields,
  T extends Payload ? T['schema'] : XyoBoundWitnessSchema
>

export type XyoBoundWitness<T extends Payload | void = void> = BoundWitness<T>
