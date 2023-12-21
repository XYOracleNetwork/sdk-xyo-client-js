import { exists } from '@xylabs/exists'
import { difference } from '@xylabs/set'
import { BoundWitness, isBoundWitness } from '@xyo-network/boundwitness'
import { PayloadHasher } from '@xyo-network/hash'
import { Payload } from '@xyo-network/payload-model'

/**
 * Returns tuples of bound witnesses and their payloads from the supplied payloads. Omits
 * bound witnesses where the payloads were not included in the supplied payloads.
 * @param payloads An array of bound witnesses and payloads
 * @returns An array of tuples of bound witnesses and their payloads
 */
export const combinationsByBoundwitness = async (payloads: Payload[]): Promise<[BoundWitness, ...Payload[]][]> => {
  const bws = new Set(payloads.filter(isBoundWitness))
  const remaining = difference(new Set(payloads), bws)
  const payloadDictionary = await PayloadHasher.toMap([...remaining])
  const results = [] as [BoundWitness, ...Payload[]][]
  for (const bw of bws) {
    const { payload_hashes } = bw
    const p = payload_hashes.map((h) => payloadDictionary[h]).filter(exists)
    if (p.length === payload_hashes.length) {
      const complete = [bw, ...p] as [BoundWitness, ...Payload[]]
      results.push(complete)
    }
  }
  return results
}
