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

  return generatePermutations(groupedPayloads)
}

describe('distinctPermutationsBySchema', () => {
  it('finds cross product of all payloads', async () => {
    const schemaA = 'network.xyo.temp.a'
    const payloadsA = [0, 1].map((i) => {
      return { i, schema: schemaA }
    })
    const schemaB = 'network.xyo.temp.b'
    const payloadsB = [0, 1].map((i) => {
      return { i, schema: schemaB }
    })
    const result = await distinctPermutationsBySchema([...payloadsA, ...payloadsB], [schemaA, schemaB])
    expect(result).toBeArrayOfSize(4)
  })
})
