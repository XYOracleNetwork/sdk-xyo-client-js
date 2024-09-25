import type { BoundWitness } from '@xyo-network/boundwitness-model'

import type { BoundWitnessArrayProperty, BoundWitnessArrayPropertyValue } from './BoundWitnessArrayProperty.ts'

/**
 * Checks if the boundwitness contains any of the values in the property. If the values array
 * is empty, it will return true. This is to match the behavior or boundWitnessContainsAll
 * which will return true if the values array is empty.
 * @param bw The boundwitness
 * @param prop The boundwitness property to check
 * @param value The values to check for in the property
 * @returns True if the boundwitness contains any of the values in the property
 */
export const boundWitnessContainsAny = <P extends BoundWitnessArrayProperty>(
  bw: BoundWitness,
  prop: P,
  values: BoundWitnessArrayPropertyValue<P>[],
): boolean => {
  if (values.length === 0) return true
  return values.some(value => (bw[prop] as BoundWitnessArrayPropertyValue<P>[])?.includes(value))
}
