import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { DivinerDivineQuerySchema, DivinerInstance } from '@xyo-network/diviner'

import { getDivinerByName, getNewPayload, insertPayload, validateDiscoverResponse } from '../../testUtil'

const divinerName = 'AddressSpaceDiviner'

describe(`/${divinerName}`, () => {
  let sut: DivinerInstance
  beforeAll(async () => {
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
    const accounts: AccountInstance[] = []
    beforeAll(async () => {
      for (let i = 0; i < 5; i++) {
        const account = Account.randomSync()
        accounts.push(account)
        const payload = getNewPayload()
        const [bw] = await new BoundWitnessBuilder().payload(payload).witness(account).build()
        await insertPayload(payload, account)
        await insertPayload(bw, account)
      }
    })
    it('returns addresses in use', async () => {
      const response = await sut.divine([])
      expect(response).toBeArray()
      expect(response.length).toBeGreaterThan(0)
      const addressPayloads = response.filter((p): p is AddressPayload => p.schema === AddressSchema)
      const addresses = addressPayloads.map((p) => p.address)
      expect(addresses).toBeArray()
      expect(addresses.length).toBeGreaterThan(0)
      expect(addresses).toIncludeAllMembers(accounts.map((account) => account.address))
    })
  })
})
