import { exists } from '@xylabs/exists'
import { asHash } from '@xylabs/hex'
import { difference } from '@xylabs/set'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload } from '@xyo-network/payload-model'

/**
 * Returns tuples of bound witnesses and their payloads from the supplied payloads. Omits
 * bound witnesses where the payloads were not included in the supplied payloads.
 * @param payloads An array of bound witnesses and payloads
 * @returns An array of tuples of bound witnesses and their payloads
 */
export const combinationsByBoundwitness = async (payloads: Payload[]): Promise<[BoundWitness, ...Payload[]][]> => {
  const bws = new Set<BoundWitness>(payloads.filter(x => isBoundWitness(x)))
  const remaining = difference(new Set(payloads), bws)
  const payloadDictionary = await PayloadBuilder.toHashMap([...remaining])
  const results = [] as [BoundWitness, ...Payload[]][]
  for (const bw of bws) {
    const { payload_hashes } = bw
    const p = payload_hashes.map(h => payloadDictionary[asHash(h, true)]).filter(exists)
    if (p.length === payload_hashes.length) {
      const complete = [bw, ...p] as [BoundWitness, ...Payload[]]
      results.push(complete)
    }
  }
  return results
}
