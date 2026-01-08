import '@xylabs/vitest-extended'

import { assertEx, delay } from '@xylabs/sdk-js'
import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessSchema, isBoundWitness } from '@xyo-network/boundwitness-model'
import { AddressChainDivinerConfigSchema } from '@xyo-network/diviner-address-chain-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeConfigSchema } from '@xyo-network/node-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import {
  describe, expect, it,
} from 'vitest'

import { MemoryAddressChainDiviner } from '../MemoryDiviner.ts'

/**
 * @group module
 * @group diviner
 */

describe('MemoryAddressHistoryDiviner', () => {
  describe('divine', () => {
    it('returns divined result', async () => {
      const node = await MemoryNode.create({ account: 'random', config: { schema: NodeConfigSchema } })
      const wrapperAccount = await Account.random()
      const divinerAccount = await Account.random()
      const archivist = await MemoryArchivist.create({
        account: 'random',
        config: { schema: MemoryArchivist.defaultConfigSchema, storeQueries: true },
      })

      const archivistWrapper = ArchivistWrapper.wrap(archivist, wrapperAccount)

      const wrapperAddress = wrapperAccount.address

      const payload1 = PayloadWrapper.wrap({ index: 1, schema: 'network.xyo.test' })
      const payload2 = PayloadWrapper.wrap({ index: 2, schema: 'network.xyo.test' })
      const payload3 = PayloadWrapper.wrap({ index: 3, schema: 'network.xyo.test' })

      for (const payload of [payload1, payload2, payload3]) {
        await delay(2)
        await archivistWrapper.insert([payload.payload])
      }
      const all = await archivist.all()
      expect(all).toBeArrayOfSize(6)

      const allBWs = all.filter(x => isBoundWitness(x))
      const lastBw = allBWs.at(-1)
      expect(lastBw).toBeDefined()
      const startHash = await PayloadBuilder.dataHash(assertEx(lastBw))

      await node.register(archivist)
      await node.attach(archivist.address)
      const diviner = await MemoryAddressChainDiviner.create({
        account: divinerAccount,
        config: {
          address: wrapperAccount.address,
          archivist: archivist.address,
          schema: AddressChainDivinerConfigSchema,
          startHash,
        },
      })
      await node.register(diviner)
      await node.attach(diviner.address)

      const result = (await diviner.divine()) as BoundWitness[]
      expect(result.length).toBe(3)
      expect(result[0].schema).toBe(BoundWitnessSchema)
      expect(result[0].addresses).toContain(wrapperAddress)
    })
  })
})
