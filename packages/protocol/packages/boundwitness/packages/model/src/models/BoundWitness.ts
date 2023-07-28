import { Payload } from '@xyo-network/payload-model'

import { BoundWitnessSchema } from './BoundWitnessSchema'

export type BoundWitnessFields = {
  _signatures: string[]
  addresses: string[]
  blockNumber?: number
  error_hashes?: string[]
  payload_hashes: string[]
  payload_schemas: string[]
  previous_hashes: (string | null)[]
  timestamp?: number
}

export type BoundWitness<T extends Payload | void = void> = Payload<
  T extends Payload ? BoundWitnessFields & T : BoundWitnessFields,
  T extends Payload ? T['schema'] : BoundWitnessSchema
>

export const isBoundWitness = (x?: Payload | null): x is BoundWitness => x?.schema === BoundWitnessSchema
export const notBoundWitness = (x?: Payload | null): x is Payload => x?.schema !== BoundWitnessSchema
