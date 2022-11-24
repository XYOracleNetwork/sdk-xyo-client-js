import { FilesystemArchivist, FilesystemArchivistConfigSchema } from './FilesystemArchivist'

test('FilesystemArchivist Load', async () => {
  const archivist = await FilesystemArchivist.create({
    config: {
      filePath: './packages/modules/packages/filesystem/packages/archivist/src/sample.archivist.xyo.json',
      schema: FilesystemArchivistConfigSchema,
    },
  })
  const all = await archivist.all()
  expect(all.length).toBe(4)
})
