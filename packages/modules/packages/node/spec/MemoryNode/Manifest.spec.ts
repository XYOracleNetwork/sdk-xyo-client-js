import { HDWallet } from '@xyo-network/account'
import { NodeManifestPayload } from '@xyo-network/manifest-model'
import { AdhocWitness, AdhocWitnessConfigSchema } from '@xyo-network/sdk'

import { MemoryNode } from '../../src'

describe('MemoryNode', () => {
  it('Creates MemoryNode from Manifest', async () => {
    const memoryNode = await MemoryNode.create({
      account: await HDWallet.random(),
      config: { name: 'MemoryNode', schema: 'network.xyo.node.config' },
    })
    const privateWitnesses = [
      await AdhocWitness.create({ account: await HDWallet.random(), config: { name: 'PrivateWitness1', schema: AdhocWitnessConfigSchema } }),
      await AdhocWitness.create({ account: await HDWallet.random(), config: { name: 'PrivateWitness2', schema: AdhocWitnessConfigSchema } }),
      await AdhocWitness.create({ account: await HDWallet.random(), config: { name: 'PrivateWitness3', schema: AdhocWitnessConfigSchema } }),
    ]
    const publicWitnesses = [
      await AdhocWitness.create({ account: await HDWallet.random(), config: { name: 'PublicWitness1', schema: AdhocWitnessConfigSchema } }),
      await AdhocWitness.create({ account: await HDWallet.random(), config: { name: 'PublicWitness2', schema: AdhocWitnessConfigSchema } }),
      await AdhocWitness.create({ account: await HDWallet.random(), config: { schema: AdhocWitnessConfigSchema } }),
      await AdhocWitness.create({ account: await HDWallet.random(), config: { schema: AdhocWitnessConfigSchema } }),
    ]
    await Promise.all(
      publicWitnesses.map(async (witness) => {
        await memoryNode.register(witness)
        await memoryNode.attach(witness.address, true)
      }),
    )
    await Promise.all(
      privateWitnesses.map(async (witness) => {
        await memoryNode.register(witness)
        await memoryNode.attach(witness.address, false)
      }),
    )
    const publicModules = await memoryNode.resolve(undefined, { visibility: 'public' })
    expect(publicModules).toBeArrayOfSize(5)
    const privateModules = await memoryNode.resolve(undefined, { visibility: 'private' })
    expect(privateModules).toBeArrayOfSize(3)
    const allModules = await memoryNode.resolve(undefined, { visibility: 'all' })
    expect(allModules).toBeArrayOfSize(8)

    const manifest = (await memoryNode.manifest()) as NodeManifestPayload
    expect(manifest.modules?.public).toBeArrayOfSize(4)
    expect(manifest.modules?.private).toBeArrayOfSize(3)
  })
})
