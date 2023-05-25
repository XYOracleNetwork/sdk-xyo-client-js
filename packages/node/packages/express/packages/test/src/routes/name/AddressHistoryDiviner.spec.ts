import { Account } from '@xyo-network/account'
import { AddressHistoryQueryPayload, AddressHistoryQuerySchema } from '@xyo-network/diviner-address-history-model'
import { ArchivistWrapper, DivinerDivineQuerySchema, DivinerWrapper } from '@xyo-network/modules'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { getArchivist, getDivinerByName, getNewBoundWitnesses, validateDiscoverResponse } from '../../testUtil'

const schema = AddressHistoryQuerySchema

const divinerName = 'AddressHistoryDiviner'

describe(`/${divinerName}`, () => {
  const account = Account.random()
  let sut: DivinerWrapper
  let archivist: ArchivistWrapper
  beforeAll(async () => {
    archivist = await getArchivist(account)
    sut = await getDivinerByName(divinerName)
  })
  describe('ModuleDiscoverQuerySchema', () => {
    it('issues query', async () => {
      const response = await sut.discover()
      expect(response).toBeArray()
      validateDiscoverResponse(response, [DivinerDivineQuerySchema])
    })
  })
  describe('XyoDivinerDivineQuerySchema', () => {
    const limit = 10
    const account = Account.random()
    let dataHashes: string[]
    beforeAll(async () => {
      const data = await getNewBoundWitnesses([account], limit, 1)
      for (const [bw, payloads] of data) {
        await archivist.insert([bw, ...payloads])
      }
      dataHashes = data.map((d) => PayloadWrapper.hash(d[0]))
    })
    it.only('issues query', async () => {
      const address = account.addressValue.hex
      const query: AddressHistoryQueryPayload = { address, limit, schema }
      const response = await sut.divine([query])
      expect(response).toBeArrayOfSize(limit)
      const responseHashes = response.map((p) => PayloadWrapper.hash(p))
      expect(responseHashes).toIncludeAllMembers(dataHashes)
    })
  })
})
