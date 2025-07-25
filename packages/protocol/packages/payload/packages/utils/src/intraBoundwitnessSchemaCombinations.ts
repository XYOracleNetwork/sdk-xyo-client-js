import { asHash, type Hash } from '@xylabs/hex'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import type { Schema } from '@xyo-network/payload-model'

/**
 * Returns all the possible combinations of payloads for the supplied schemas within the bound witness
 * @param boundwitness The bound witness to search
 * @param schemas The schemas to search for unique combinations of
 * @returns The payload hashes corresponding to the unique combinations of the supplied schemas
 */
export const intraBoundwitnessSchemaCombinations = (boundwitness: BoundWitness, schemas: Schema[]): Hash[][] => {
  // Map to store the indices of each element in the source array
  const indexMap: Record<string, number[]> = {}

  // Populate the index map with positions of each element
  for (const [index, element] of boundwitness.payload_schemas.entries()) {
    if (!indexMap[element]) {
      indexMap[element] = []
    }
    indexMap[element].push(index)
  }

  // Initialize an array to store unique combinations
  let uniqueCombinations = [[]] as number[][]

  // Iterate over each element in the target array
  for (const element of schemas) {
    const newCombinations: number[][] = []
    // Get the array of indices for the current element
    const indices = indexMap[element] || []

    // Iterate over existing combinations
    for (const combination of uniqueCombinations) {
      // Iterate over each index in the indices array
      for (const index of indices) {
        // Check if the index is already in the combination
        if (!combination.includes(index)) {
          const newCombination = [...combination, index]
          // Only add the new combination if its length matches the current target index
          if (newCombination.length === schemas.indexOf(element) + 1) {
            newCombinations.push(newCombination)
          }
        }
      }
    }

    // Update the unique combinations for the next iteration
    uniqueCombinations = newCombinations
  }

  return uniqueCombinations.map((indexes) => {
    return indexes.map((index) => {
      return asHash(boundwitness.payload_hashes[index], true)
    })
  })
}
