import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitness, BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { AddressChainDivinerConfigSchema } from '@xyo-network/diviner-address-chain-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeConfigSchema } from '@xyo-network/node-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { MemoryAddressChainDiviner } from '../MemoryDiviner'

/**
 * @group module
 * @group diviner
 */

describe('MemoryAddressHistoryDiviner', () => {
  describe('divine', () => {
    it('returns divined result', async () => {
      const nodeAccount = Account.randomSync()
      const node = await MemoryNode.create({ account: nodeAccount, config: { schema: NodeConfigSchema } })
      const wrapperAccount = Account.randomSync()
      const divinerAccount = Account.randomSync()
      const archivistAccount = Account.randomSync()
      const archivist = ArchivistWrapper.wrap(
        await MemoryArchivist.create({ account: archivistAccount, config: { schema: MemoryArchivist.configSchema, storeQueries: true } }),
        wrapperAccount,
      )

      const payload1 = await PayloadWrapper.wrap({ index: 1, schema: 'network.xyo.test' })
      const payload2 = await PayloadWrapper.wrap({ index: 2, schema: 'network.xyo.test' })
      const payload3 = await PayloadWrapper.wrap({ index: 3, schema: 'network.xyo.test' })

      await archivist.insert([payload1.jsonPayload()])
      await archivist.insert([payload2.jsonPayload()])
      await archivist.insert([payload3.jsonPayload()])

      const all = await archivist.all()

      expect(all).toBeArrayOfSize(8)

      await node.register(archivist)
      await node.attach(archivist.address)
      const diviner = await MemoryAddressChainDiviner.create({
        account: divinerAccount,
        config: {
          address: wrapperAccount.address,
          archivist: archivist.address,
          schema: AddressChainDivinerConfigSchema,
          startHash: await (await BoundWitnessWrapper.parse(all[6])).hashAsync(),
        },
      })
      await node.register(diviner)
      await node.attach(diviner.address)

      const result = (await diviner.divine()) as BoundWitness[]
      expect(result.length).toBe(4)
      expect(result[0].schema).toBe(BoundWitnessSchema)
      expect(result[0].addresses).toContain(wrapperAccount.address)
    })
  })
})
