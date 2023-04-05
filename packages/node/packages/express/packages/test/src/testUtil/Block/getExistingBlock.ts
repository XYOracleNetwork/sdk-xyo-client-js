import { BoundWitness } from '@xyo-network/boundwitness-model'

import { getExistingPayloadByHash } from '../Payload'

export const getExistingBlockByHash = <T extends BoundWitness = BoundWitness>(hash: string): Promise<T> => {
  return getExistingPayloadByHash<T>(hash)
}
