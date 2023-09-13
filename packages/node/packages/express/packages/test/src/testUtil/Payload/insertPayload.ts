import { AccountInstance } from '@xyo-network/account-model'
import { Payload } from '@xyo-network/payload-model'

import { unitTestSigningAccount } from '../Account'
import { getArchivist } from '../Archivist'
import { getNewPayload } from './getNewPayload'

export const insertPayload = async (payloads?: Payload | Payload[], account?: AccountInstance): Promise<Payload[]> => {
  const resolvedPayloads = payloads ?? (await getNewPayload())
  const archivist = await getArchivist(account ?? (await unitTestSigningAccount()))
  const data = Array.isArray(resolvedPayloads) ? resolvedPayloads : [resolvedPayloads]
  return archivist.insert(data)
}
