import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistModule, ArchivistWrapper } from '@xyo-network/archivist'

import { unitTestSigningAccount } from '../Account'
import { getModuleByName } from '../Node'

export const getArchivist = async (account?: AccountInstance): Promise<ArchivistWrapper> => {
  const module = await getModuleByName<ArchivistModule>('Archivist')
  return new ArchivistWrapper({ account: account ?? (await unitTestSigningAccount()), module })
}
