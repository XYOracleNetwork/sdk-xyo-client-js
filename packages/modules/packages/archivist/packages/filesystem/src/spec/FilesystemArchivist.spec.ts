import '@xylabs/vitest-extended'

import { expect, test } from 'vitest'

import { FilesystemArchivist, FilesystemArchivistConfigSchema } from '../FilesystemArchivist.ts'

/**
 * @group module
 * @group archivist
 */

test('FilesystemArchivist Load', async () => {
  const archivist = (await FilesystemArchivist.create({
    account: 'random',
    config: {
      filePath: './packages/modules/packages/archivist/packages/filesystem/src/sample.archivist.xyo.json',
      schema: FilesystemArchivistConfigSchema,
    },
  })) as FilesystemArchivist
  const all = await archivist.next({ limit: Number.MAX_SAFE_INTEGER })
  expect(all.length).toBe(4)
})
