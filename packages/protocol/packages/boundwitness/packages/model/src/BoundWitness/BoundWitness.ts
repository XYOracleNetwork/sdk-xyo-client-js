import type {
  Address, Hash, Hex,
} from '@xylabs/hex'
import type { EmptyObject } from '@xylabs/object'
import type { Payload, Schema } from '@xyo-network/payload-model'

import type { BoundWitnessSchema } from './BoundWitnessSchema.ts'

export interface BoundWitnessRequiredFields {
  /** @field Array of signatures by the accounts that are listed in addresses */
  addresses: Address[]
  payload_hashes: Hash[]
  payload_schemas: Schema[]
  previous_hashes: (Hash | null)[]
}

export type BoundWitnessOptionalFields = {
  /** @field sequential number (if this boundwitness is part of a multi-party chain) zero padded to 32 characters */
  block?: Hex
  /** @field unique id of a multi-party chain (usually staking contract address) */
  chain?: Hex
}

export interface BoundWitnessFields extends BoundWitnessRequiredFields, BoundWitnessOptionalFields {}

export type UnsignedBoundWitness<T extends Payload | EmptyObject | void = void> = Payload<
  T extends void ? BoundWitnessFields : BoundWitnessFields & T,
  T extends void ? BoundWitnessSchema
    : T extends Payload ? T['schema']
      : BoundWitnessSchema
>

export type Signed<T> = T & {
  $signatures: Hex[]
  $timestamp?: number
}

export type WithMetaTimestamp = BoundWitness & { $timestamp: number }
export type WithBlock = BoundWitness & { block: Hex }

export const hasMetaTimestamp = (bw: BoundWitness): bw is WithMetaTimestamp => bw.$timestamp !== undefined && typeof bw.$timestamp === 'number'
export const hasBlock = (bw: BoundWitness): bw is WithBlock => bw.block !== undefined && typeof bw.block === 'string'

export type BoundWitness<T extends Payload | EmptyObject | void = void> = Signed<UnsignedBoundWitness<T>>
