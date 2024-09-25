import type { BoundWitness } from '@xyo-network/boundwitness-model'

/**
 * The properties of a boundwitness that are string-like arrays
 */
export type BoundWitnessArrayProperty = keyof Pick<BoundWitness,
  'addresses' |
  // 'error_hashes' |
  'payload_hashes' |
  'payload_schemas'
  // 'previous_hashes'
>

/**
 * A helper type to get the correct type for the `values` argument based on the `prop`
 */
export type BoundWitnessArrayPropertyValue<P extends BoundWitnessArrayProperty> = BoundWitness[P] extends (infer T)[] ? T : never
