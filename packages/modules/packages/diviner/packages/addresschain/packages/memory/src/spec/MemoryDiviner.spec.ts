import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitness, BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { AddressChainDivinerConfigSchema } from '@xyo-network/diviner-address-chain-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { MemoryNode } from '@xyo-network/node'
import { NodeConfigSchema } from '@xyo-network/node-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { MemoryAddressChainDiviner } from '../MemoryDiviner'

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

      const payload1 = PayloadWrapper.wrap({ index: 1, schema: 'network.xyo.test' })
      const payload2 = PayloadWrapper.wrap({ index: 2, schema: 'network.xyo.test' })
      const payload3 = PayloadWrapper.wrap({ index: 3, schema: 'network.xyo.test' })

      await archivist.insert([payload1.payload()])
      await archivist.insert([payload2.payload()])
      await archivist.insert([payload3.payload()])

      const all = await archivist.all()

      expect(all).toBeArrayOfSize(7)

      console.log(JSON.stringify(all, null, 2))

      await node.register(archivist)
      await node.attach(archivist.address)
      const diviner = DivinerWrapper.wrap(
        await MemoryAddressChainDiviner.create({
          account: divinerAccount,
          config: {
            address: wrapperAccount.address,
            archivist: archivist.address,
            schema: AddressChainDivinerConfigSchema,
            startHash: await BoundWitnessWrapper.parse(all[6]).hashAsync(),
          },
        }),
        wrapperAccount,
      )
      await node.register(diviner)
      await node.attach(diviner.address)

      const result = (await diviner.divine()) as BoundWitness[]
      expect(result.length).toBe(4)
      expect(result[0].schema).toBe(BoundWitnessSchema)
      expect(result[0].addresses).toContain(wrapperAccount.address)
    })
  })
})
