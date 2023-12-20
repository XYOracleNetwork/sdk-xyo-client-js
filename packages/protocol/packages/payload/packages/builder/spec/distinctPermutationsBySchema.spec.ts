import { PayloadHasher } from '@xyo-network/hash'
import { Payload } from '@xyo-network/payload-model'

// Assuming you have an asynchronous serialization function like this
async function asyncSerializePayloads(array: Payload[]): Promise<string> {
  return (await Promise.all(array.map((p) => PayloadHasher.hashAsync(p)))).join('|')
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
  describe('with single', () => {
    it('finds the distinct permutations of all payloads', async () => {
      const schemaA = 'network.xyo.temp.a'
      const payloadsA = [0, 1].map((i) => {
        return { i, schema: schemaA }
      })
      const payloadsB = [2, 3].map((i) => {
        return { i, schema: schemaA }
      })
      const schemas = [schemaA]
      const result = await distinctPermutationsBySchema([...payloadsA, ...payloadsB], schemas)
      expect(result).toBeArrayOfSize(4)
    })
    it('filters duplicates', async () => {
      const schemaA = 'network.xyo.temp.a'
      const payloadsA = [0, 1].map((i) => {
        return { i, schema: schemaA }
      })
      const payloadsB = [0, 1].map((i) => {
        return { i, schema: schemaA }
      })
      const schemas = [schemaA]
      const result = await distinctPermutationsBySchema([...payloadsA, ...payloadsB], schemas)
      expect(result).toBeArrayOfSize(Math.pow(2, schemas.length))
    })
  })
  describe('with two schemas', () => {
    it('finds the distinct permutations of all payloads', async () => {
      const schemaA = 'network.xyo.temp.a'
      const payloadsA = [0, 1].map((i) => {
        return { i, schema: schemaA }
      })
      const schemaB = 'network.xyo.temp.b'
      const payloadsB = [0, 1].map((i) => {
        return { i, schema: schemaB }
      })
      const schemas = [schemaA, schemaB]
      const result = await distinctPermutationsBySchema([...payloadsA, ...payloadsB], schemas)
      expect(result).toBeArrayOfSize(Math.pow(2, schemas.length))
    })
  })
  describe('with multiple schemas', () => {
    it('finds the distinct permutations of all payloads', async () => {
      const schemaA = 'network.xyo.temp.a'
      const payloadsA = [0, 1].map((i) => {
        return { i, schema: schemaA }
      })
      const schemaB = 'network.xyo.temp.b'
      const payloadsB = [0, 1].map((i) => {
        return { i, schema: schemaB }
      })
      const schemaC = 'network.xyo.temp.c'
      const payloadsC = [0, 1].map((i) => {
        return { i, schema: schemaC }
      })
      const schemas = [schemaA, schemaB, schemaC]
      const result = await distinctPermutationsBySchema([...payloadsA, ...payloadsB, ...payloadsC], schemas)
      expect(result).toBeArrayOfSize(Math.pow(2, schemas.length))
    })
  })
})
