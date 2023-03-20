import { ArchivistWrapper } from '@xyo-network/archivist'

import { getBridge } from '../Bridge'

export const getArchivist = async (): Promise<ArchivistWrapper> => {
  const name = ['Archivist']
  const modules = await (await getBridge()).downResolver.resolve({ name })
  expect(modules).toBeArrayOfSize(1)
  const archivist = modules.pop()
  expect(archivist).toBeObject()
  return ArchivistWrapper.wrap(archivist)
}
