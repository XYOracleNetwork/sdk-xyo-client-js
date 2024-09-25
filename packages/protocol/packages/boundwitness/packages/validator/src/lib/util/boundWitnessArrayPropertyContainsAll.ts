import type { BoundWitness } from '@xyo-network/boundwitness-model'

import type { BoundWitnessArrayProperty, BoundWitnessArrayPropertyValue } from './BoundWitnessArrayProperty.ts'

/**
 * Checks if the boundwitness property contains all of the values
 * @param bw The boundwitness
 * @param prop The boundwitness property to check
 * @param values The values to check for in the property
 * @returns True if the boundwitness contains all of the values in the property
 */
export const boundWitnessArrayPropertyContainsAll = <P extends BoundWitnessArrayProperty>(
  bw: BoundWitness,
  prop: P,
  values: BoundWitnessArrayPropertyValue<P>[],
): boolean => {
  return values.every(v => (bw[prop] as BoundWitnessArrayPropertyValue<P>[])?.includes(v))
}
