import { Account } from '@xyo-network/account'
import { AddressChainDivinerConfigSchema } from '@xyo-network/addresschain-diviner-model'
import { ArchivistWrapper, MemoryArchivist, MemoryArchivistConfigSchema } from '@xyo-network/archivist'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { MemoryNode } from '@xyo-network/node'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { MemoryAddressChainDiviner } from '../MemoryDiviner'

describe('MemoryAddressHistoryDiviner', () => {
  describe('divine', () => {
    it('returns divined result', async () => {
      const node = await MemoryNode.create()
      const account = Account.random()
      const archivist = ArchivistWrapper.wrap(
        await MemoryArchivist.create({ config: { schema: MemoryArchivistConfigSchema, storeQueries: true } }),
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
      const diviner = await MemoryAddressChainDiviner.create({
        config: { address: account.addressValue.hex, schema: AddressChainDivinerConfigSchema, startHash: BoundWitnessWrapper.parse(all[6]).hash },
      })
      await node.register(diviner)
      await node.attach(diviner.address)
      const divinerWrapper = DivinerWrapper.wrap(diviner)
      const result = await divinerWrapper.divine()
      expect(result.length).toBe(4)
    })
  })
})
