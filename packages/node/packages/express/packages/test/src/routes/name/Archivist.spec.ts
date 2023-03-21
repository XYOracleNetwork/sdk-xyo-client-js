import { ArchivistGetQuerySchema, ArchivistInsertQuerySchema, ArchivistWrapper } from '@xyo-network/modules'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { getArchivist, getNewPayload, validateDiscoverResponse } from '../../testUtil'

const moduleName = 'Archivist'

describe(`/${moduleName}`, () => {
  let archivist: ArchivistWrapper
  let payload: PayloadWrapper = PayloadWrapper.parse(getNewPayload())
  beforeAll(async () => {
    archivist = await getArchivist()
  })
  describe('ModuleDiscoverQuerySchema', () => {
    it('issues query', async () => {
      const response = await archivist.discover()
      expect(response).toBeArray()
      validateDiscoverResponse(response, [ArchivistGetQuerySchema, ArchivistInsertQuerySchema])
    })
  })
  describe('ArchivistInsertQuerySchema', () => {
    it('issues query', async () => {
      const response = await archivist.insert([payload.payload])
      expect(response).toBeArray()
      expect(response.length).toBeGreaterThan(0)
      const bw = response.at(-1)
      expect(bw).toBeObject()
      expect(bw?.payload_hashes).toBeArray()
      expect(bw?.payload_hashes).toContain(payload.hash)
    })
  })
  describe('ArchivistGetQuerySchema', () => {
    beforeAll(async () => {
      payload = PayloadWrapper.parse(getNewPayload())
      const result = await archivist.insert([payload.payload])
      expect(result).toBeTruthy()
    })
    it('issues query', async () => {
      const response = await archivist.get([payload.hash])
      expect(response).toBeArrayOfSize(1)
      const actual = response.pop()
      expect(PayloadWrapper.parse(actual).hash).toBe(payload.hash)
    })
  })
})
