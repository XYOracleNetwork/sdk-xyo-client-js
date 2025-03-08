import { exists } from '@xylabs/exists'
import type { Hash } from '@xylabs/hex'
import { isHash } from '@xylabs/hex'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { isBoundWitnessWithStorageMeta } from '@xyo-network/boundwitness-model'
import type { WithStorageMeta } from '@xyo-network/payload-model'

import type { ReadArchivist } from '../PayloadArchivist.ts'
import { getTypedBoundWitness, tryGetTypedBoundWitness } from './getBoundWitness.ts'
import type { HydratedBoundWitness } from './HydratedBoundWitness.ts'
import type { IdentityFunction } from './IdentityFunction.ts'

export const tryHydrateTypedBoundWitness = async <T extends BoundWitness>(archivist: ReadArchivist, hashOrBw: Hash | WithStorageMeta<T>,
  identity: IdentityFunction<WithStorageMeta<T>>): Promise<HydratedBoundWitness<T> | undefined> => {
  const bw = isHash(hashOrBw) ? await tryGetTypedBoundWitness(archivist, hashOrBw, identity) : hashOrBw
  return bw ? [bw, (await archivist.get(bw?.payload_hashes)).filter(exists)] : undefined
}

export const hydrateTypedBoundWitness = async <T extends BoundWitness>(archivist: ReadArchivist, hashOrBw: Hash | WithStorageMeta<T>,
  identity: IdentityFunction<WithStorageMeta<T>>): Promise<HydratedBoundWitness<T>> => {
  const bw = isHash(hashOrBw) ? await getTypedBoundWitness(archivist, hashOrBw, identity) : hashOrBw
  const payloads = (await archivist.get(bw?.payload_hashes)).filter(exists)
  if (payloads.length !== bw.payload_hashes.length) {
    throw new Error(`missing payloads for ${bw._hash}`)
  }
  return [bw, payloads]
}

export const hydrateBoundWitness = (
  archivist: ReadArchivist,
  hashOrBw: Hash | WithStorageMeta<BoundWitness>,
): Promise<HydratedBoundWitness<BoundWitness>> => {
  return hydrateTypedBoundWitness<BoundWitness>(archivist, hashOrBw, isBoundWitnessWithStorageMeta)
}
