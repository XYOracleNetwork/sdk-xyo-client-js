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

const distinctPermutationsBySchema = async (payloads: Payload[], schemas: string[]): Promise<Payload[][]> => {
  // Group payloads by schema
  const groupedPayloads: Record<string, Payload[]> = Object.fromEntries(schemas.map((schema) => [schema, []]))
  for (const payload of payloads) {
    if (schemas.includes(payload.schema)) {
      groupedPayloads[payload.schema].push(payload)
    }
  }

  // Set to track seen (serialized) permutations for uniqueness check
  const seen: Set<string> = new Set()
  // Start with an array containing an empty permutation
  let permutations = [[]] as Payload[][]

  // Iterate over each schema
  for (const schema of schemas) {
    const newPermutations: Payload[][] = []
    // Iterate over existing permutations
    for (const perm of permutations) {
      // Iterate over payloads for the current schema
      for (const payload of groupedPayloads[schema]) {
        // Create a new permutation by adding the current payload
        const newPerm = [...perm, payload]
        // Proceed with serialization only if the permutation is complete
        if (newPerm.length === schemas.length) {
          // Serialize the new permutation asynchronously
          const serialized = await generateKeyForTuple(newPerm)
          // Check if the serialized permutation is unique
          if (!seen.has(serialized)) {
            // Add it to the set of seen permutations
            seen.add(serialized)
            // Add the new permutation to the list of new permutations
            newPermutations.push(newPerm)
          }
        } else {
          // Add incomplete permutations to the list for further processing
          newPermutations.push(newPerm)
        }
      }
    }
    // Update the list of permutations for the next schema iteration
    permutations = newPermutations
  }

  // Return the unique permutations
  return permutations
}

describe('distinctPermutationsBySchema', () => {
  const payloadCount = 2
  const testMatrix: [string, string[]][] = [
    ['with single schema', ['network.xyo.temp.a']],
    ['with two schemas', ['network.xyo.temp.a', 'network.xyo.temp.b']],
    ['with with many schemas', ['network.xyo.temp.a', 'network.xyo.temp.b', 'network.xyo.temp.c']],
  ]
  describe.each(testMatrix)('%s', (_title, schemas) => {
    const payloads = schemas.map((schema) => {
      return [...Array(payloadCount).keys()].map((i) => {
        return { i, schema }
      })
    })
    it('finds the distinct permutations of all payloads', async () => {
      const result = await distinctPermutationsBySchema(payloads.flat(), schemas)
      expect(result).toBeArrayOfSize(Math.pow(payloadCount, schemas.length))
    })
    it('filters duplicates', async () => {
      const result = await distinctPermutationsBySchema([...payloads.flat(), ...payloads[0]], schemas)
      expect(result).toBeArrayOfSize(Math.pow(payloadCount, schemas.length))
    })
  })
  describe.skip('with one dimension very large', () => {
    const payloadCount = 5_000_000
    const schemaA = 'network.xyo.temp.a'
    const payloadsA = [...Array(payloadCount).keys()].map((i) => {
      return { i, schema: schemaA }
    })
    const schemaB = 'network.xyo.temp.b'
    const payloadsB = [{ i: 0, schema: schemaB }]
    const payloads = [...payloadsA, ...payloadsB]
    const schemas = [schemaA, schemaB]
    it('finds the distinct permutations of all payloads', async () => {
      const result = await distinctPermutationsBySchema(payloads.flat(), schemas)
      expect(result).toBeArrayOfSize(Math.pow(payloadsA.length, payloadsB.length))
    })
  })
})
