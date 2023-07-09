import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { MemoryArchivist } from '@xyo-network/archivist'
import { AddressHistoryDivinerConfigSchema, AddressHistoryQuerySchema } from '@xyo-network/diviner-address-history-model'
import { MemoryNode } from '@xyo-network/node'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { AddressHistoryDiviner } from '../Diviner'

describe('AddressHistoryDiviner', () => {
  describe('divine', () => {
    const account: AccountInstance = Account.randomSync()
    let node: MemoryNode
    let archivist: MemoryArchivist
    let diviner: AddressHistoryDiviner
    beforeAll(async () => {
      node = await MemoryNode.create()
      archivist = await MemoryArchivist.create({ config: { schema: MemoryArchivist.configSchema, storeQueries: true } })
      const payload1 = PayloadWrapper.wrap({ index: 1, schema: 'network.xyo.test' })
      const payload2 = PayloadWrapper.wrap({ index: 2, schema: 'network.xyo.test' })
      const payload3 = PayloadWrapper.wrap({ index: 3, schema: 'network.xyo.test' })
      await archivist.insert([payload1.payload()])
      await archivist.insert([payload2.payload()])
      await archivist.insert([payload3.payload()])
      const all = await archivist.all()
      expect(all).toBeArrayOfSize(3)
      await node.register(archivist)
      await node.attach(archivist.address)
      diviner = await AddressHistoryDiviner.create({
        config: { address: account.address, schema: AddressHistoryDivinerConfigSchema },
      })
      await node.register(diviner)
      await node.attach(diviner.address)
    })
    describe.skip('with query payload', () => {
      it('returns divined result for queried addresses', async () => {
        const query = { address: account.address, schema: AddressHistoryQuerySchema }
        const result = await diviner.divine([query])
        expect(result.length).toBe(1)
      })
    })
    describe('with no query payloads', () => {
      it('returns divined result for all addresses', async () => {
        const result = await diviner.divine()
        expect(result.length).toBe(1)
      })
    })
  })
})
