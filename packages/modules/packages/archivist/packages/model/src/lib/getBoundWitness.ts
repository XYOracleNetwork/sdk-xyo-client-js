import { assertEx } from '@xylabs/assert'
import { Hash } from '@xylabs/hex'
import { BoundWitness, isBoundWitnessWithStorageMeta } from '@xyo-network/boundwitness-model'
import { WithStorageMeta } from '@xyo-network/payload-model'

import { ReadArchivist } from '../PayloadArchivist.ts'
import { IdentityFunction } from './IdentityFunction.ts'

export const tryGetTypedBoundWitness = async <T extends BoundWitness>(archivist: ReadArchivist, hash: Hash,
  identity: IdentityFunction<WithStorageMeta<T>>): Promise<WithStorageMeta<T> | undefined> => {
  const payload = (await archivist.get([hash])).at(0)
  return identity(payload) ? payload : undefined
}

export const getTypedBoundWitness = async <T extends BoundWitness>(archivist: ReadArchivist, hash: Hash,
  identity: IdentityFunction<WithStorageMeta<T>>): Promise<WithStorageMeta<T>> => {
  const payload = assertEx((await archivist.get([hash])).at(0), () => `failed to locate bound witness: ${hash}`)
  return assertEx(identity(payload) ? payload : undefined, () => `located payload failed identity check: ${hash}`)
}

export const getBoundWitness = (archivist: ReadArchivist, hash: Hash): Promise<WithStorageMeta<BoundWitness>> => {
  return getTypedBoundWitness<BoundWitness>(archivist, hash, isBoundWitnessWithStorageMeta)
}
