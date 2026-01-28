import '@xylabs/vitest-extended'

import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { AddressSpaceDivinerConfigSchema } from '@xyo-network/diviner-address-space-model'
import { AddressSchema } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { asSchema } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import {
  describe, expect, it,
} from 'vitest'

import { MemoryAddressSpaceDiviner } from '../MemoryAddressSpaceDiviner.ts'

/**
 * @group module
 * @group diviner
 */

describe('MemoryAddressSpaceDiviner', () => {
  describe('divine (listed archivists)', () => {
    it('returns divined result', async () => {
      const node = await MemoryNode.create({ account: 'random' })
      const archivistAccount = await Account.random()
      const divinerAccount = await Account.random()
      const wrapperAccount = await Account.random()
      const archivist = ArchivistWrapper.wrap(
        await MemoryArchivist.create({ account: archivistAccount, config: { schema: MemoryArchivist.defaultConfigSchema, storeQueries: true } }),
        wrapperAccount,
      )

      const payload1 = PayloadWrapper.wrap({ index: 1, schema: asSchema('network.xyo.test', true) })
      const payload2 = PayloadWrapper.wrap({ index: 2, schema: asSchema('network.xyo.test', true) })
      const payload3 = PayloadWrapper.wrap({ index: 3, schema: asSchema('network.xyo.test', true) })

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
      const addresses = results.map(payload => payload.address)
      expect(addresses).toContain(wrapperAccount.address)
    })
  })
})
