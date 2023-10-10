import { Payload } from '@xyo-network/payload-model'

import { BoundWitnessSchema } from './BoundWitnessSchema'

export type BoundWitnessFields = {
  /** @field Array of signatures by the accounts that are listed in addresses */
  _signatures: string[]
  /** @field Array of signatures by the accounts that are listed in addresses */
  addresses: string[]
  blockNumber?: number
  error_hashes?: string[]
  payload_hashes: string[]
  payload_schemas: string[]
  previous_hashes: (string | null)[]
  /** @field Hash of the QueryBoundWitness that caused this BoundWitness to be created  */
  sourceQuery?: string
  timestamp?: number
}

export type BoundWitness<T extends Payload | void = void> = Payload<
  T extends Payload ? BoundWitnessFields & T : BoundWitnessFields,
  T extends Payload ? T['schema'] : BoundWitnessSchema
>
