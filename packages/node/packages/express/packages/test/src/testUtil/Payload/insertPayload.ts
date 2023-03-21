import { AccountInstance } from '@xyo-network/account-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { Payload } from '@xyo-network/payload-model'

import { unitTestSigningAccount } from '../Account'
import { getArchivist } from '../Archivist'
import { getNewPayload } from './getNewPayload'

export const insertPayload = async (
  payloads: Payload | Payload[] = getNewPayload(),
  account: AccountInstance = unitTestSigningAccount,
): Promise<BoundWitness[]> => {
  const archivist = await getArchivist(account)
  const data = Array.isArray(payloads) ? payloads : [payloads]
  return archivist.insert(data)
}
