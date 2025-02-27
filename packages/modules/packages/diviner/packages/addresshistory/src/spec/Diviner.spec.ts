import '@xylabs/vitest-extended'

import type { AccountInstance } from '@xyo-network/account'
import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { AddressHistoryDivinerConfigSchema, AddressHistoryQuerySchema } from '@xyo-network/diviner-address-history-model'
import { MemoryNode } from '@xyo-network/node-memory'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import { AddressHistoryDiviner } from '../Diviner.ts'

/**
 * @group module
 * @group diviner
 */

describe('AddressHistoryDiviner', () => {
  describe('divine', () => {
    let archivistAccount: AccountInstance
    let wrapperAccount: AccountInstance
    let divinerAccount: AccountInstance
    let node: MemoryNode
    let archivist: MemoryArchivist
    let diviner: AddressHistoryDiviner
    beforeAll(async () => {
      archivistAccount = await Account.random()
      wrapperAccount = await Account.random()
      divinerAccount = await Account.random()
      node = await MemoryNode.create({ account: 'random' })
      archivist = await MemoryArchivist.create({
        account: archivistAccount,
        config: { schema: MemoryArchivist.defaultConfigSchema, storeQueries: true },
      })
      const wrapper = ArchivistWrapper.wrap(archivist, wrapperAccount)
      const payload1 = { index: 1, schema: 'network.xyo.test' }
      const payload2 = { index: 2, schema: 'network.xyo.test' }
      const payload3 = { index: 3, schema: 'network.xyo.test' }
      await wrapper.insert([payload1])
      await wrapper.insert([payload2])
      await wrapper.insert([payload3])
      const all = await wrapper.all()
      expect(all).toBeArrayOfSize(6)
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
        expect(result[0].addresses.includes(wrapperAccount.address)).toBeTrue()
      })
    })
  })
})
