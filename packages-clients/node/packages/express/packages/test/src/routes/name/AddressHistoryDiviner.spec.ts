import { Account } from '@xyo-network/account'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { PayloadHasher } from '@xyo-network/core'
import { DivinerDivineQuerySchema, DivinerInstance } from '@xyo-network/diviner'
import { AddressHistoryQueryPayload, AddressHistoryQuerySchema } from '@xyo-network/diviner-address-history-model'

import { getArchivist, getDivinerByName, getNewBoundWitnesses, validateDiscoverResponse } from '../../testUtil'

const schema = AddressHistoryQuerySchema

const divinerName = 'AddressHistoryDiviner'

describe(`/${divinerName}`, () => {
  const account = Account.randomSync()
  let sut: DivinerInstance
  let archivist: ArchivistInstance
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
  describe('DivinerDivineQuerySchema', () => {
    const limit = 10
    const account = Account.randomSync()
    let dataHashes: string[]
    beforeAll(async () => {
      const data = await getNewBoundWitnesses([account], limit, 1)
      for (const [bw, payloads] of data) {
        await archivist.insert([bw, ...payloads])
      }
      dataHashes = await PayloadHasher.hashes(data.map((d) => d[0]))
    })
    it.only('issues query', async () => {
      const address = account.address
      const query: AddressHistoryQueryPayload = { address, limit, schema }
      const response = await sut.divine([query])
      expect(response).toBeArrayOfSize(limit)
      const responseHashes = await PayloadHasher.hashes(response)
      expect(responseHashes).toIncludeAllMembers(dataHashes)
    })
  })
})
