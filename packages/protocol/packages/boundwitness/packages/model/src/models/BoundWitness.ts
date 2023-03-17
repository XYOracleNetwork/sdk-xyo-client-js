import { Payload } from '@xyo-network/payload-model'

import { BoundWitnessSchema } from './BoundWitnessSchema'

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
  T extends Payload ? BoundWitnessFields & T : BoundWitnessFields,
  T extends Payload ? T['schema'] : BoundWitnessSchema
>

export type XyoBoundWitness<T extends Payload | void = void> = BoundWitness<T>
