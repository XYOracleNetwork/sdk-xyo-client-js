import { Account } from '@xyo-network/account'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { AddressSpaceDivinerConfigSchema } from '@xyo-network/diviner-address-space-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { MemoryAddressSpaceDiviner } from '../MemoryAddressSpaceDiviner'

/**
 * @group module
 * @group diviner
 */

describe('MemoryAddressSpaceDiviner', () => {
  describe('divine (listed archivists)', () => {
    it('returns divined result', async () => {
      const node = await MemoryNode.create({ account: Account.randomSync() })
      const archivistAccount = Account.randomSync()
      const divinerAccount = Account.randomSync()
      const wrapperAccount = Account.randomSync()
      const archivist = ArchivistWrapper.wrap(
        await MemoryArchivist.create({ account: archivistAccount, config: { schema: MemoryArchivist.configSchema, storeQueries: true } }),
        wrapperAccount,
      )

      const payload1 = await PayloadWrapper.wrap({ index: 1, schema: 'network.xyo.test' })
      const payload2 = await PayloadWrapper.wrap({ index: 2, schema: 'network.xyo.test' })
      const payload3 = await PayloadWrapper.wrap({ index: 3, schema: 'network.xyo.test' })

      await archivist.insert([payload1.payload])
      await archivist.insert([payload2.payload])
      await archivist.insert([payload3.payload])

      const all = await archivist.all()

      expect(all).toBeArrayOfSize(6)

      await node.register(archivist)
      await node.attach(archivist.address)
      const diviner = await MemoryAddressSpaceDiviner.create({
        account: divinerAccount,
        config: { archivist: archivist.address, schema: AddressSpaceDivinerConfigSchema },
      })
      await node.register(diviner)
      await node.attach(diviner.address)
      const results = await diviner.divine()
      expect(results.length).toBe(1)
      for (const payload of results) {
        expect(payload.schema).toBe(AddressSchema)
      }
      const addresses = results.map((payload) => payload.address)
      expect(addresses).toContain(wrapperAccount.address)
    })
  })
})
