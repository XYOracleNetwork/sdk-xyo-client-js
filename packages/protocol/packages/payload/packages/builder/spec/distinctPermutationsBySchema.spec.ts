import { PayloadHasher } from '@xyo-network/hash'
import { Payload } from '@xyo-network/payload-model'

// Assuming you have an asynchronous serialization function like this
const asyncSerializePayloads = async (array: Payload[]): Promise<string> => {
  // return (await Promise.all(array.map((p) => PayloadHasher.hashAsync(p)))).join('|')
  await Promise.resolve() // Here to reserve the right to make this async
  return array.map((p) => PayloadHasher.stringifyHashFields(p)).join('|')
}

const distinctPermutationsBySchema = async (payloads: Payload[], schemas: string[]): Promise<Payload[][]> => {
  // Group payloads by schema
  const groupedPayloads: Record<string, Payload[]> = {}
  for (const payload of payloads) {
    if (schemas.includes(payload.schema)) {
      if (!groupedPayloads[payload.schema]) {
        groupedPayloads[payload.schema] = []
      }
      groupedPayloads[payload.schema].push(payload)
    }
  }

  // Recursive function to generate permutations
  const generatePermutations = async (
    groups: Record<string, Payload[]>,
    perm: Payload[] = [],
    seen: Set<string> = new Set(),
  ): Promise<Payload[][]> => {
    if (perm.length === schemas.length) {
      const serialized = await asyncSerializePayloads(perm)
      if (!seen.has(serialized)) {
        seen.add(serialized)
        return [perm]
      }
      return []
    } else {
      const schema = schemas[perm.length]
      return (
        await Promise.all(
          groups[schema].flatMap(async (item) => {
            const newPerm = [...perm, item]
            return await generatePermutations(groups, newPerm, seen)
          }),
        )
      ).flat()
    }
  }

  return await generatePermutations(groupedPayloads)
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
    const payloadCount = 1_000_000
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
