import { PayloadHasher } from '@xyo-network/hash'
import type { Payload } from '@xyo-network/payload-model'

/**
 * Generates a unique key for a tuple of payloads
 * @param payloads An array of payloads
 * @returns A string that is a unique key for the payloads
 */
const generateKeyForTuple = async (payloads: Payload[]): Promise<string> => {
  // return (await Promise.all(array.map((p) => PayloadBuilder.dataHash(p)))).join('|')
  await Promise.resolve() // Here to reserve the right to make this async
  return payloads.map(p => PayloadHasher.stringifyHashFields(p)).join('|')
}

/**
 * Returns the unique combinations of payloads for the given schemas
 * @param payloads An array of payloads
 * @param schemas An array of schemas
 * @returns An array of unique combinations of payloads
 */
export const combinationsBySchema = async (payloads: Payload[], schemas: string[]): Promise<Payload[][]> => {
  // Group payloads by schema
  const groupedPayloads: Record<string, Payload[]> = Object.fromEntries(schemas.map(schema => [schema, []]))
  for (const payload of payloads) {
    if (schemas.includes(payload.schema)) {
      groupedPayloads[payload.schema].push(payload)
    }
  }

  // Set to track seen (serialized) combinations for uniqueness check
  const seen: Set<string> = new Set()
  // Start with an array containing an empty combination
  let combinations = [[]] as Payload[][]

  // Iterate over each schema
  for (const schema of schemas) {
    const newCombinations: Payload[][] = []
    // Iterate over existing combinations
    for (const combination of combinations) {
      // Iterate over payloads for the current schema
      for (const payload of groupedPayloads[schema]) {
        // Create a new combination by adding the current payload
        const newPerm = [...combination, payload]
        // Proceed with serialization only if the combination is complete
        if (newPerm.length === schemas.length) {
          // Serialize the new combination asynchronously
          const serialized = await generateKeyForTuple(newPerm)
          // Check if the serialized combination is unique
          if (!seen.has(serialized)) {
            // Add it to the set of seen combinations
            seen.add(serialized)
            // Add the new combination to the list of new combinations
            newCombinations.push(newPerm)
          }
        } else {
          // Add incomplete combinations to the list for further processing
          newCombinations.push(newPerm)
        }
      }
    }
    // Update the list of combinations for the next schema iteration
    combinations = newCombinations
  }

  // Return the unique combinations
  return combinations
}
