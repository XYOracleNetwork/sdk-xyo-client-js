import { BoundWitness } from '@xyo-network/boundwitness-model'

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
 * The value of the underlying array type for the BoundWitness array property
 */
export type BoundWitnessArrayPropertyValue<P extends BoundWitnessArrayProperty> = BoundWitness[P] extends (infer T)[] ? T : never
