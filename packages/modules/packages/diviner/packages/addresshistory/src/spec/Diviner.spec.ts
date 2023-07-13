import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist'
import { IndirectArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AddressHistoryDivinerConfigSchema, AddressHistoryQuerySchema } from '@xyo-network/diviner-address-history-model'
import { MemoryNode } from '@xyo-network/node'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { AddressHistoryDiviner } from '../Diviner'

describe('AddressHistoryDiviner', () => {
  describe('divine', () => {
    const archivistAccount = Account.randomSync()
    const wrapperAccount = Account.randomSync()
    const divinerAccount = Account.randomSync()
    let node: MemoryNode
    let archivist: MemoryArchivist
    let diviner: AddressHistoryDiviner
    beforeAll(async () => {
      node = await MemoryNode.create()
      archivist = await MemoryArchivist.create({ account: archivistAccount, config: { schema: MemoryArchivist.configSchema, storeQueries: true } })
      const wrapper = IndirectArchivistWrapper.wrap(archivist, wrapperAccount)
      const payload1 = PayloadWrapper.wrap({ index: 1, schema: 'network.xyo.test' })
      const payload2 = PayloadWrapper.wrap({ index: 2, schema: 'network.xyo.test' })
      const payload3 = PayloadWrapper.wrap({ index: 3, schema: 'network.xyo.test' })
      await wrapper.insert([payload1.payload()])
      await wrapper.insert([payload2.payload()])
      await wrapper.insert([payload3.payload()])
      const all = await wrapper.all()
      expect(all).toBeArrayOfSize(7)
      await node.register(archivist)
      await node.attach(archivist.address)
      diviner = await AddressHistoryDiviner.create({
        account: divinerAccount,
        config: { address: wrapperAccount.address, schema: AddressHistoryDivinerConfigSchema },
      })
      await node.register(diviner)
      await node.attach(diviner.address)
    })
    describe.skip('with query payload', () => {
      it('returns divined result for queried addresses', async () => {
        const query = { address: wrapperAccount.address, schema: AddressHistoryQuerySchema }
        const result = await diviner.divine([query])
        expect(result.length).toBe(1)
      })
    })
    describe('with no query payloads', () => {
      it('returns divined result for all addresses', async () => {
        const result = (await diviner.divine()) as BoundWitness[]
        expect(result.length).toBe(2)
        expect(result[0].addresses).toInclude(wrapperAccount.address)
      })
    })
  })
})
