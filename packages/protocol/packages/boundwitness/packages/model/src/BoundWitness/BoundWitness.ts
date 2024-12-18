import type {
  Address, Hash, Hex,
} from '@xylabs/hex'
import type { EmptyObject } from '@xylabs/object'
import type { Payload, Schema } from '@xyo-network/payload-model'

import type { BoundWitnessSchema } from './BoundWitnessSchema.ts'

export type BoundWitnessFields = {
  $meta: {
    /** @field Array of signatures by the accounts that are listed in addresses */
    signatures: Hex[]
  }
  /** @field Array of signatures by the accounts that are listed in addresses */
  addresses: Address[]
  /** @field sequential number (if this boundwitness is part of a multi-party chain) */
  block?: number
  /** @field unique id of a multi-party chain */
  chain?: Hex
  error_hashes?: Hash[]
  payload_hashes: Hash[]
  payload_schemas: Schema[]
  previous_hashes: (Hash | null)[]
  timestamp?: number
  /**
   * @field sequential number of the tower (if this boundwitness is part of a multi-party chain)
   * The tower should always be zero until block reaches 2^32 which then causes it to rollover to 0
   * and increases the tower by 1
  */
  tower?: number
}

export type BoundWitness<T extends Payload | EmptyObject | void = void> = Payload<
  T extends void ? BoundWitnessFields : BoundWitnessFields & T,
  T extends void ? BoundWitnessSchema
    : T extends Payload ? T['schema']
      : BoundWitnessSchema
>
