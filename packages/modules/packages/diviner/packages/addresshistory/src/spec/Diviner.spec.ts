import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AddressHistoryDivinerConfigSchema, AddressHistoryQuerySchema } from '@xyo-network/diviner-address-history-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'

import { AddressHistoryDiviner } from '../Diviner'

/**
 * @group module
 * @group diviner
 */

describe('AddressHistoryDiviner', () => {
  describe('divine', () => {
    const archivistAccount = Account.randomSync()
    const wrapperAccount = Account.randomSync()
    const divinerAccount = Account.randomSync()
    let node: MemoryNode
    let archivist: MemoryArchivist
    let diviner: AddressHistoryDiviner
    beforeAll(async () => {
      node = await MemoryNode.create({ account: Account.randomSync() })
      archivist = await MemoryArchivist.create({ account: archivistAccount, config: { schema: MemoryArchivist.configSchema, storeQueries: true } })
      const wrapper = ArchivistWrapper.wrap(archivist, wrapperAccount)
      const payload1 = await PayloadBuilder.build({ index: 1, schema: 'network.xyo.test' })
      const payload2 = await PayloadBuilder.build({ index: 2, schema: 'network.xyo.test' })
      const payload3 = await PayloadBuilder.build({ index: 3, schema: 'network.xyo.test' })
      await wrapper.insert([payload1])
      await wrapper.insert([payload2])
      await wrapper.insert([payload3])
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
        expect(result.length).toBe(1)
        expect(result[0].addresses).toInclude(wrapperAccount.address)
      })
    })
  })
})
