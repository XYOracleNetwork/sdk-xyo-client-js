import type { BoundWitnessMeta, BoundWitnessWithMeta, BoundWitnessWithPartialMeta, PayloadMeta, PayloadWithMeta } from '@xyo-network/payload-mongodb'
import { BoundWitnessMapResult, flatMapBoundWitness } from '@xyo-network/payload-mongodb'

import { augmentWithMetadata } from './augmentWithMetadata'
import { removePayloads } from './removePayloads'

export interface PrepareBoundWitnessesResult {
  payloads: PayloadWithMeta[]
  sanitized: BoundWitnessWithMeta[]
}

export const prepareBoundWitnesses = async (
  boundWitnesses: BoundWitnessWithPartialMeta[],
  boundWitnessMetaData: BoundWitnessMeta,
  payloadMetaData: PayloadMeta,
): Promise<PrepareBoundWitnessesResult> => {
  const flattened: BoundWitnessMapResult = boundWitnesses
    .map(flatMapBoundWitness)
    .reduce((prev, curr) => [prev[0].concat(curr[0]), prev[1].concat(curr[1])], [[], []])
  const sanitized: BoundWitnessWithMeta[] = removePayloads(await augmentWithMetadata(flattened[0], boundWitnessMetaData))
  const payloads: PayloadWithMeta[] = await augmentWithMetadata(flattened[1], payloadMetaData)
  return { payloads, sanitized }
}
