import { Payload } from '@xyo-network/payload-model'

import { getExistingPayloadByHash } from '../Payload'

export const getHash = <T extends Payload>(hash: string): Promise<T> => {
  return getExistingPayloadByHash<T>(hash)
}
