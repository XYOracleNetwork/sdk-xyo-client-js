import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistWrapper, MemoryArchivist } from '@xyo-network/archivist'
import { AddressHistoryDivinerConfigSchema, AddressHistoryQuerySchema } from '@xyo-network/diviner-address-history-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { MemoryNode } from '@xyo-network/node'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { AddressHistoryDiviner } from '../Diviner'

describe('AddressHistoryDiviner', () => {
  describe('divine', () => {
    const account: AccountInstance = Account.random()
    let node: MemoryNode
    let archivist: MemoryArchivist
    let archivistWrapper: ArchivistWrapper
    let diviner: AddressHistoryDiviner
    let divinerWrapper: DivinerWrapper
    beforeAll(async () => {
      node = await MemoryNode.create()
      archivist = await MemoryArchivist.create({ config: { schema: MemoryArchivist.configSchema, storeQueries: true } })
      archivistWrapper = ArchivistWrapper.wrap(archivist, account)
      const payload1 = PayloadWrapper.parse({ index: 1, schema: 'network.xyo.test' })
      const payload2 = PayloadWrapper.parse({ index: 2, schema: 'network.xyo.test' })
      const payload3 = PayloadWrapper.parse({ index: 3, schema: 'network.xyo.test' })
      await archivistWrapper.insert([payload1.payload()])
      await archivistWrapper.insert([payload2.payload()])
      await archivistWrapper.insert([payload3.payload()])
      const all = await archivistWrapper.all()
      expect(all).toBeArrayOfSize(7)
      await node.register(archivistWrapper)
      await node.attach(archivistWrapper.address)
      diviner = await AddressHistoryDiviner.create({
        config: { address: account.addressValue.hex, schema: AddressHistoryDivinerConfigSchema },
      })
      await node.register(diviner)
      await node.attach(diviner.address)
      divinerWrapper = DivinerWrapper.wrap(diviner)
    })
    describe.skip('with query payload', () => {
      it('returns divined result for queried addresses', async () => {
        const query = { address: account.addressValue.hex, schema: AddressHistoryQuerySchema }
        const result = await divinerWrapper.divine([query])
        expect(result.length).toBe(1)
      })
    })
    describe('with no query payloads', () => {
      it('returns divined result for all addresses', async () => {
        const result = await divinerWrapper.divine()
        expect(result.length).toBe(2)
      })
    })
  })
})
