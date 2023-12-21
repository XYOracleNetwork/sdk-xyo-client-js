import { BoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/hash'
import { Payload } from '@xyo-network/payload-model'

/**
 * Generates a unique key for a tuple of payloads
 * @param payloads An array of payloads
 * @returns A string that is a unique key for the payloads
 */
const generateKeyForTuple = async (payloads: Payload[]): Promise<string> => {
  // return (await Promise.all(array.map((p) => PayloadHasher.hashAsync(p)))).join('|')
  await Promise.resolve() // Here to reserve the right to make this async
  return payloads.map((p) => PayloadHasher.stringifyHashFields(p)).join('|')
}

export const intraBoundwitnessSchemaCombinations = (source: string[], target: string[]): number[][] => {
  // Map to store the indices of each element in the source array
  const indexMap: Record<string, number[]> = {}

  // Populate the index map with positions of each element
  for (const [index, element] of source.entries()) {
    if (!indexMap[element]) {
      indexMap[element] = []
    }
    indexMap[element].push(index)
  }

  // Initialize an array to store unique combinations
  let uniqueCombinations = [[]] as number[][]

  // Iterate over each element in the target array
  for (const element of target) {
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
          if (newCombination.length === target.indexOf(element) + 1) {
            newCombinations.push(newCombination)
          }
        }
      }
    }

    // Update the unique combinations for the next iteration
    uniqueCombinations = newCombinations
  }

  return uniqueCombinations
}
