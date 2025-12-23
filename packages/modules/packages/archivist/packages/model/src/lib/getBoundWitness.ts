import type { Hash, IdentityFunction } from '@xylabs/sdk-js'
import { assertEx } from '@xylabs/sdk-js'
import { type BoundWitness, isBoundWitness } from '@xyo-network/boundwitness-model'
import { isStorageMeta, type WithStorageMeta } from '@xyo-network/payload-model'

import type { ReadArchivist } from '../PayloadArchivist.ts'

export const tryGetTypedBoundWitnessWithStorageMeta = async <T extends BoundWitness>(archivist: ReadArchivist, hash: Hash,
  identity: IdentityFunction<WithStorageMeta<T>>): Promise<WithStorageMeta<T> | undefined> => {
  const payload = (await archivist.get([hash])).at(0)
  return identity(payload) ? payload : undefined
}

export const getTypedBoundWitnessWithStorageMeta = async <T extends BoundWitness>(archivist: ReadArchivist, hash: Hash,
  identity: IdentityFunction<WithStorageMeta<T>>): Promise<WithStorageMeta<T>> => {
  const payload = assertEx((await archivist.get([hash])).at(0), () => `failed to locate bound witness: ${hash}`)
  return assertEx(identity(payload) ? payload : undefined, () => `located payload failed identity check: ${hash}`)
}

export const getBoundWitnessWithStorageMeta = (archivist: ReadArchivist, hash: Hash): Promise<WithStorageMeta<BoundWitness>> => {
  return getTypedBoundWitnessWithStorageMeta<BoundWitness>(archivist, hash, x => isStorageMeta(x) && isBoundWitness(x))
}
