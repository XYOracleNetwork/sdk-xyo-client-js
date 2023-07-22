import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'

import { getModuleByName } from '../Node'

export const getArchivist = async (account?: AccountInstance): Promise<ArchivistInstance> => {
  const archivist = asArchivistInstance(await getModuleByName('Archivist'), 'Failed to cast archivist')
  return account ? ArchivistWrapper.wrap(archivist, account) : archivist
}
