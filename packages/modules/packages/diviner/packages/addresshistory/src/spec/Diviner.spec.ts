import { Account } from '@xyo-network/account'
import { ArchivistWrapper, MemoryArchivist } from '@xyo-network/archivist'
import { AddressHistoryDivinerConfigSchema, AddressHistoryQuerySchema } from '@xyo-network/diviner-address-history-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { MemoryNode } from '@xyo-network/node'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { AddressHistoryDiviner } from '../Diviner'

describe('AddressHistoryDiviner', () => {
  describe('divine', () => {
    describe('with query payload', () => {
      it('returns divined result for queried addresses', async () => {
        const node = await MemoryNode.create()
        const account = Account.random()
        const archivist = ArchivistWrapper.wrap(
          await MemoryArchivist.create({ config: { schema: MemoryArchivist.configSchema, storeQueries: true } }),
          account,
        )

        const payload1 = PayloadWrapper.parse({ index: 1, schema: 'network.xyo.test' })
        const payload2 = PayloadWrapper.parse({ index: 2, schema: 'network.xyo.test' })
        const payload3 = PayloadWrapper.parse({ index: 3, schema: 'network.xyo.test' })

        await archivist.insert([payload1.payload])
        await archivist.insert([payload2.payload])
        await archivist.insert([payload3.payload])

        const all = await archivist.all()

        expect(all).toBeArrayOfSize(7)

        await node.register(archivist)
        await node.attach(archivist.address)
        const diviner = await AddressHistoryDiviner.create({
          config: { address: account.addressValue.hex, schema: AddressHistoryDivinerConfigSchema },
        })
        await node.register(diviner)
        await node.attach(diviner.address)
        const divinerWrapper = DivinerWrapper.wrap(diviner)
        const query = { address: account.addressValue.hex, schema: AddressHistoryQuerySchema }
        const result = await divinerWrapper.divine([query])
        expect(result.length).toBe(1)
      })
    })
    describe('with no query payloads', () => {
      it('returns divined result for all addresses', async () => {
        const node = await MemoryNode.create()
        const account = Account.random()
        const archivist = ArchivistWrapper.wrap(
          await MemoryArchivist.create({ config: { schema: MemoryArchivist.configSchema, storeQueries: true } }),
          account,
        )

        const payload1 = PayloadWrapper.parse({ index: 1, schema: 'network.xyo.test' })
        const payload2 = PayloadWrapper.parse({ index: 2, schema: 'network.xyo.test' })
        const payload3 = PayloadWrapper.parse({ index: 3, schema: 'network.xyo.test' })

        await archivist.insert([payload1.payload])
        await archivist.insert([payload2.payload])
        await archivist.insert([payload3.payload])

        const all = await archivist.all()

        expect(all).toBeArrayOfSize(7)

        await node.register(archivist)
        await node.attach(archivist.address)
        const diviner = await AddressHistoryDiviner.create({
          config: { address: account.addressValue.hex, schema: AddressHistoryDivinerConfigSchema },
        })
        await node.register(diviner)
        await node.attach(diviner.address)
        const divinerWrapper = DivinerWrapper.wrap(diviner)
        const result = await divinerWrapper.divine()
        expect(result.length).toBe(1)
      })
    })
  })
})
