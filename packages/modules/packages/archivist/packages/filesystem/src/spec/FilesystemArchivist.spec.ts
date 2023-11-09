import { Account } from '@xyo-network/account'

import { FilesystemArchivist, FilesystemArchivistConfigSchema } from '../FilesystemArchivist'

test('FilesystemArchivist Load', async () => {
  const archivist = (await FilesystemArchivist.create({
    account: Account.randomSync(),
    config: {
      filePath: './packages/modules/packages/archivist/packages/filesystem/src/sample.archivist.xyo.json',
      schema: FilesystemArchivistConfigSchema,
    },
  })) as FilesystemArchivist
  const all = await archivist.all()
  expect(all.length).toBe(4)
})
