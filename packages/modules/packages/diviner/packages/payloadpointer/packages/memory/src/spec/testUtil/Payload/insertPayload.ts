import { AccountInstance } from '@xyo-network/account-model'
import { Payload } from '@xyo-network/payload-model'

import { unitTestSigningAccount } from '../Account/index.js'
import { getNewPayload } from './getNewPayload.js'

export const insertPayload = async (payloads?: Payload | Payload[], account?: AccountInstance): Promise<Payload[]> => {
  const archivist = await getArchivistByName('XYOPublic:Archivist', account ?? (await unitTestSigningAccount()))
  const workingPayloads = payloads ?? (await getNewPayload())
  const data = Array.isArray(workingPayloads) ? workingPayloads : [workingPayloads]
  return archivist.insert(data)
}
