import { Account } from '@xyo-network/account'
import { IndirectArchivistWrapper, MemoryArchivist } from '@xyo-network/archivist'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { AddressChainDivinerConfigSchema } from '@xyo-network/diviner-address-chain-model'
import { MemoryNode } from '@xyo-network/node'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { MemoryAddressChainDiviner } from '../MemoryDiviner'

describe('MemoryAddressHistoryDiviner', () => {
  describe('divine', () => {
    it('returns divined result', async () => {
      const node = await MemoryNode.create()
      const divinerAccount = Account.randomSync()
      const archivistAccount = Account.randomSync()
      const archivist = IndirectArchivistWrapper.wrap(
        await MemoryArchivist.create({ config: { schema: MemoryArchivist.configSchema, storeQueries: true } }),
        archivistAccount,
      )

      const payload1 = PayloadWrapper.wrap({ index: 1, schema: 'network.xyo.test' })
      const payload2 = PayloadWrapper.wrap({ index: 2, schema: 'network.xyo.test' })
      const payload3 = PayloadWrapper.wrap({ index: 3, schema: 'network.xyo.test' })

      await archivist.insert([payload1.payload()])
      await archivist.insert([payload2.payload()])
      await archivist.insert([payload3.payload()])

      const all = await archivist.all()

      expect(all).toBeArrayOfSize(4)

      await node.register(archivist)
      await node.attach(archivist.address)
      const diviner = await MemoryAddressChainDiviner.create({
        account: divinerAccount,
        config: {
          address: archivistAccount.address,
          archivist: archivist.address,
          schema: AddressChainDivinerConfigSchema,
          startHash: await BoundWitnessWrapper.parse(all[2]).hashAsync(),
        },
      })
      await node.register(diviner)
      await node.attach(diviner.address)

      const result = await diviner.divine()
      expect(result.length).toBe(3)
    })
  })
})
