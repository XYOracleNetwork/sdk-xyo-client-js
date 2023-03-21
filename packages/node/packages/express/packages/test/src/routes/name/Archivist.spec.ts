import { ArchivistGetQuerySchema, ArchivistInsertQuerySchema, ArchivistWrapper } from '@xyo-network/modules'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { getArchivist, getNewPayload, validateDiscoverResponseContainsQuerySchemas } from '../../testUtil'

const moduleName = 'Archivist'

describe(`/${moduleName}`, () => {
  let archivist: ArchivistWrapper
  beforeAll(async () => {
    archivist = await getArchivist()
  })
  describe('ModuleDiscoverQuerySchema', () => {
    it('issues query', async () => {
      const response = await archivist.discover()
      expect(response).toBeArray()
      validateDiscoverResponseContainsQuerySchemas(response, [ArchivistGetQuerySchema, ArchivistInsertQuerySchema])
    })
  })
  describe('ArchivistInsertQuerySchema', () => {
    it('issues query', async () => {
      const payload = getNewPayload()
      const hash = PayloadWrapper.parse(payload).hash
      const response = await archivist.insert([payload])
      expect(response).toBeArray()
      expect(response.length).toBeGreaterThan(0)
      const bw = response.at(-1)
      expect(bw).toBeObject()
      expect(bw?.payload_hashes).toBeArray()
      expect(bw?.payload_hashes).toContain(hash)
    })
  })
  describe('ArchivistGetQuerySchema', () => {
    const payload = getNewPayload()
    beforeAll(async () => {
      const result = await archivist.insert([payload])
      expect(result).toBeTruthy()
    })
    it('issues query', async () => {
      const hash = PayloadWrapper.parse(payload).hash
      const response = await archivist.get([hash])
      expect(response).toBeArrayOfSize(1)
      const actual = response.pop()
      expect(PayloadWrapper.parse(actual).hash).toBe(hash)
    })
  })
})
