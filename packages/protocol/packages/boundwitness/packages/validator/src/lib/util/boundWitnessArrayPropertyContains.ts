import type { BoundWitness } from '@xyo-network/boundwitness-model'

import type { BoundWitnessArrayProperty, BoundWitnessArrayPropertyValue } from './BoundWitnessArrayProperty.ts'

/**
 * Checks if the boundwitness contains the addresses
 * @param bw The boundwitness
 * @param prop The boundwitness property to check
 * @param value The value to check for in the property
 * @returns True if the boundwitness property contains the value
 */
export const boundWitnessArrayPropertyContains = <P extends BoundWitnessArrayProperty>(
  bw: BoundWitness,
  prop: P,
  value: BoundWitnessArrayPropertyValue<P>,

): boolean => {
  return (bw[prop] as BoundWitnessArrayPropertyValue<P>[])?.includes(value)
}
