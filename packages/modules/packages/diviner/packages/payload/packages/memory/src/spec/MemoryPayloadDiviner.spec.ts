import { HDWallet } from '@xyo-network/account'
import { PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { MemoryArchivist } from '@xyo-network/memory-archivist'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'

import { MemoryPayloadDiviner } from '../MemoryPayloadDiviner'

describe('MemoryPayloadDiviner', () => {
  let archivist: MemoryArchivist
  let sut: MemoryPayloadDiviner
  let node: MemoryNode
  const payloadA = {
    schema: 'network.xyo.test',
    url: 'https://xyo.network',
  }
  const payloadB = {
    foo: ['bar', 'baz'],
    schema: 'network.xyo.debug',
  }
  beforeAll(async () => {
    archivist = await MemoryArchivist.create({
      config: { name: 'test', schema: MemoryArchivist.configSchema },
      wallet: await HDWallet.random(),
    })
    await archivist.insert([payloadA, payloadB])
    sut = await MemoryPayloadDiviner.create({
      config: {
        archivist: archivist.address,
        schema: MemoryPayloadDiviner.configSchema,
      },
      wallet: await HDWallet.random(),
    })
    node = await MemoryNode.create({
      config: { schema: MemoryNode.configSchema },
      wallet: await HDWallet.random(),
    })
    const modules = [archivist, sut]
    await node.start()
    await Promise.all(
      modules.map(async (mod) => {
        await node.register(mod)
        await node.attach(mod.address, true)
      }),
    )
  })
  describe('with filter for', () => {
    describe('single schema', () => {
      it.each(['network.xyo.test', 'network.xyo.debug'])('only returns payloads of that schema', async (schema) => {
        const schemas = [schema]
        const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).fields({ schemas }).build()
        const results = await sut.divine([query])
        expect(results.length).toBeGreaterThan(0)
        expect(results.every((result) => result.schema === schema)).toBe(true)
      })
    })
    describe('multiple schemas', () => {
      it('only returns payloads of that schema', async () => {
        const schemas = ['network.xyo.test', 'network.xyo.debug']
        const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).fields({ schemas }).build()
        const results = await sut.divine([query])
        expect(results.length).toBeGreaterThan(0)
        expect(results.every((result) => schemas.includes(result.schema))).toBe(true)
      })
    })
  })
})
