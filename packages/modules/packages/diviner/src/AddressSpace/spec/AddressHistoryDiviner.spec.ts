import { Account } from '@xyo-network/account'
import { ArchivistWrapper, MemoryArchivist, MemoryArchivistConfigSchema } from '@xyo-network/archivist'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { MemoryNode } from '@xyo-network/node'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { AddressPayload, AddressSchema } from '@xyo-network/plugins'

import { MemoryAddressSpaceDiviner, MemoryAddressSpaceDivinerConfigSchema } from '../MemoryAddressSpaceDiviner'

describe('AddressSpaceDiviner', () => {
  describe('divine', () => {
    it('returns divined result', async () => {
      const node = await MemoryNode.create()
      const account = Account.random()
      const archivist = new ArchivistWrapper(
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

      await node.register(archivist).attach(archivist.address)
      const diviner = await MemoryAddressSpaceDiviner.create({
        config: { address: account.addressValue.hex, schema: MemoryAddressSpaceDivinerConfigSchema },
      })
      await node.register(diviner).attach(diviner.address)
      const divinerWrapper = new DivinerWrapper(diviner)
      const result = await divinerWrapper.divine()
      expect(result.length).toBe(1)
      const payload = PayloadWrapper.parse<AddressPayload>(result[0])
      expect(payload.schema).toBe(AddressSchema)
      expect(payload.payload.address).toBe(account.addressValue.hex)
    })
  })
})
