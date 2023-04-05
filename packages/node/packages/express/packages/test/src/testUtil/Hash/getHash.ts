import { BoundWitness } from '@xyo-network/boundwitness-model'
import { Payload } from '@xyo-network/payload-model'

import { getExistingPayloadByHash } from '../Payload'

export const getHash = <T extends Payload>(hash: string): Promise<BoundWitness | Payload> => {
  return getExistingPayloadByHash<T>(hash)
}
