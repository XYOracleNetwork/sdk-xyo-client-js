import { Account } from '@xyo-network/account'
import { IndirectArchivistWrapper, MemoryArchivist } from '@xyo-network/archivist'
import { AddressSpaceDivinerConfigSchema } from '@xyo-network/diviner-address-space-model'
import { MemoryNode } from '@xyo-network/node'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { AddressPayload, AddressSchema } from '@xyo-network/plugins'

import { MemoryAddressSpaceDiviner } from '../MemoryAddressSpaceDiviner'

describe('MemoryAddressSpaceDiviner', () => {
  describe('divine (listed archivists)', () => {
    it('returns divined result', async () => {
      const node = await MemoryNode.create()
      const account = Account.randomSync()
      const archivist = IndirectArchivistWrapper.wrap(
        await MemoryArchivist.create({ config: { schema: MemoryArchivist.configSchema, storeQueries: true } }),
        account,
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
      const diviner = await MemoryAddressSpaceDiviner.create({
        config: { archivist: archivist.address, schema: AddressSpaceDivinerConfigSchema },
      })
      await node.register(diviner)
      await node.attach(diviner.address)
      const results = await diviner.divine()
      expect(results.length).toBe(1)
      results.forEach((payload) => {
        expect(payload.schema).toBe(AddressSchema)
      })
      const addresses = results
        .map((payload) => PayloadWrapper.wrap<AddressPayload>(payload as AddressPayload))
        .map((payload) => payload.payload().address)
      expect(addresses).toEqual([account.address])
    })
  })
})
