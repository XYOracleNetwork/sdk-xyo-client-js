import { Address, Hash, Hex } from '@xylabs/hex'
import { EmptyObject } from '@xylabs/object'
import { Payload, Schema } from '@xyo-network/payload-model'

import { BoundWitnessSchema } from './BoundWitnessSchema'

export type BoundWitnessFields = {
  $meta: {
    /** @field Array of signatures by the accounts that are listed in addresses */
    signatures: Hex[]
  }
  /** @field Array of signatures by the accounts that are listed in addresses */
  addresses: Address[]
  blockNumber?: number
  error_hashes?: Hash[]
  payload_hashes: Hash[]
  payload_schemas: Schema[]
  previous_hashes: (Hash | null)[]
  /** @field Hash of the QueryBoundWitness that caused this BoundWitness to be created  */
  sourceQuery?: Hash
  timestamp: number
}

export type BoundWitness<T extends Payload | EmptyObject | void = void> = Payload<
  T extends void ? BoundWitnessFields : BoundWitnessFields & T,
  T extends void ? BoundWitnessSchema
  : T extends Payload ? T['schema']
  : BoundWitnessSchema
>
