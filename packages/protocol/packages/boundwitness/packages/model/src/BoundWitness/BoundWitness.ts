import type {
  Address, Hash, Hex,
} from '@xylabs/hex'
import type { EmptyObject, JsonObject } from '@xylabs/object'
import type { Payload, Schema } from '@xyo-network/payload-model'

import type { BoundWitnessSchema } from './BoundWitnessSchema.ts'

export interface BoundWitnessRequiredFields {
  /** @field Array of signatures by the accounts that are listed in addresses */
  addresses: Address[]
  payload_hashes: Hash[]
  payload_schemas: Schema[]
  previous_hashes: (Hash | null)[]
}

export interface BoundWitnessMeta {
  /**
   * @field The address to which the query is directed
   */
  $destination?: Address
  /**
   * @field The query that initiated the bound witness
   */
  $sourceQuery?: Hash
}

export interface BoundWitnessBlockField {
  /** @field sequential number (if this boundwitness is part of a multi-party chain) */
  block: number
}

export interface BoundWitnessChainField {
  /** @field unique id of a multi-party chain (usually staking contract address) */
  chain: Hex
}

export interface BoundWitnessOptionalFields extends Partial<BoundWitnessBlockField>, Partial<BoundWitnessChainField> {
  root: Hash
}

export interface BoundWitnessFields extends BoundWitnessRequiredFields, Partial<BoundWitnessOptionalFields> {}

export type UnsignedBoundWitness<T extends EmptyObject | void = void> = Payload<
  T extends void ? BoundWitnessFields : BoundWitnessFields & T,
  BoundWitnessSchema
> & BoundWitnessMeta

export type Signed<T extends UnsignedBoundWitness = UnsignedBoundWitness> = T & {
  $signatures: Hex[]
}

export type SignedBoundWitness = Signed<UnsignedBoundWitness>

export type WithBlock = BoundWitness & BoundWitnessBlockField

export const hasBlock = (bw: BoundWitness): bw is WithBlock => bw.block !== undefined && typeof bw.block === 'string'
export const asBlock = (bw: BoundWitness): WithBlock => bw as WithBlock

export type BoundWitness<T extends Payload | EmptyObject | void = void> = Signed<UnsignedBoundWitness<T>>

export type AnyBoundWitness = BoundWitness<JsonObject>
