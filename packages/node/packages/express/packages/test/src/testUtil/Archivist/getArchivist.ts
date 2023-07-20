import { AccountInstance } from '@xyo-network/account-model'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'

import { unitTestSigningAccount } from '../Account'
import { getModuleByName } from '../Node'

export const getArchivist = async (account?: AccountInstance): Promise<ArchivistWrapper> => {
  const module = asArchivistInstance(await getModuleByName('Archivist'), 'Failed to cast archivist')
  return ArchivistWrapper.wrap(module, account ?? (await unitTestSigningAccount()))
}
