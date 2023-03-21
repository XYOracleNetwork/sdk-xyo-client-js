import { assertEx } from '@xylabs/assert'
import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistWrapper } from '@xyo-network/archivist'

import { getBridge } from '../Bridge'

export const getArchivist = async (account?: AccountInstance): Promise<ArchivistWrapper> => {
  const name = ['Archivist']
  const modules = await (await getBridge()).downResolver.resolve({ name })
  expect(modules).toBeArrayOfSize(1)
  const archivist = modules.pop()
  expect(archivist).toBeObject()
  const module = assertEx(archivist)
  return account ? new ArchivistWrapper({ account, module }) : ArchivistWrapper.wrap(archivist)
}
