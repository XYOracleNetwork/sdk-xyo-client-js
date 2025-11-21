import { exists } from '@xylabs/exists'
import type { Hash } from '@xylabs/hex'
import { isHash } from '@xylabs/hex'
import type { IdentityFunction } from '@xylabs/typeof'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { isStorageMeta, type WithStorageMeta } from '@xyo-network/payload-model'

import type { ReadArchivist } from '../PayloadArchivist.ts'
import { getTypedBoundWitnessWithStorageMeta, tryGetTypedBoundWitnessWithStorageMeta } from './getBoundWitness.ts'
import type { HydratedBoundWitness } from './HydratedBoundWitness.ts'

export const tryHydrateTypedBoundWitness = async <T extends BoundWitness>(archivist: ReadArchivist, hashOrBw: Hash | WithStorageMeta<T>,
  identity: IdentityFunction<WithStorageMeta<T>>): Promise<HydratedBoundWitness<T> | undefined> => {
  const bw = isHash(hashOrBw) ? await tryGetTypedBoundWitnessWithStorageMeta(archivist, hashOrBw, identity) : hashOrBw
  return bw ? [bw, (await archivist.get(bw?.payload_hashes as Hash[])).filter(exists)] : undefined
}

export const hydrateTypedBoundWitness = async <T extends BoundWitness>(archivist: ReadArchivist, hashOrBw: Hash | WithStorageMeta<T>,
  identity: IdentityFunction<WithStorageMeta<T>>): Promise<HydratedBoundWitness<T>> => {
  const bw = isHash(hashOrBw) ? await getTypedBoundWitnessWithStorageMeta(archivist, hashOrBw, identity) : hashOrBw
  const payloads = (await archivist.get(bw?.payload_hashes as Hash[])).filter(exists)
  if (payloads.length !== bw.payload_hashes.length) {
    throw new Error(`missing payloads for ${bw._hash}`)
  }
  return [bw, payloads]
}

export const hydrateBoundWitness = (
  archivist: ReadArchivist,
  hashOrBw: Hash | WithStorageMeta<BoundWitness>,
): Promise<HydratedBoundWitness<BoundWitness>> => {
  const idFunction: IdentityFunction<WithStorageMeta<BoundWitness>> = x => isBoundWitness(x) && isStorageMeta(x)
  return hydrateTypedBoundWitness<BoundWitness>(archivist, hashOrBw, idFunction)
}
