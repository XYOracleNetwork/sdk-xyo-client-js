import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistModule, IndirectArchivistWrapper } from '@xyo-network/archivist'

import { unitTestSigningAccount } from '../Account'
import { getModuleByName } from '../Node'

export const getArchivist = async (account?: AccountInstance): Promise<IndirectArchivistWrapper> => {
  const module = await getModuleByName<ArchivistModule>('Archivist')
  return IndirectArchivistWrapper.wrap(module, account ?? (await unitTestSigningAccount()))
}
