import { Account } from '@xyo-network/account'
import { NodeManifestPayload } from '@xyo-network/manifest-model'
import { AdhocWitness, AdhocWitnessConfigSchema } from '@xyo-network/witness-adhoc'

import { MemoryNode } from '../../src'

/**
 * @group node
 * @group module
 */

describe('MemoryNode', () => {
  //AbstractModule.defaultLogger = new ConsoleLogger(LogLevel.log)
  it('Creates MemoryNode from Manifest', async () => {
    const memoryNode = await MemoryNode.create({
      account: Account.randomSync(),
      config: { name: 'MemoryNode', schema: 'network.xyo.node.config' },
    })
    const privateWitnesses = [
      await AdhocWitness.create({ account: Account.randomSync(), config: { name: 'PrivateWitness1', schema: AdhocWitnessConfigSchema } }),
      await AdhocWitness.create({ account: Account.randomSync(), config: { name: 'PrivateWitness2', schema: AdhocWitnessConfigSchema } }),
      await AdhocWitness.create({ account: Account.randomSync(), config: { name: 'PrivateWitness3', schema: AdhocWitnessConfigSchema } }),
    ]
    const publicWitnesses = [
      await AdhocWitness.create({ account: Account.randomSync(), config: { name: 'PublicWitness1', schema: AdhocWitnessConfigSchema } }),
      await AdhocWitness.create({ account: Account.randomSync(), config: { name: 'PublicWitness2', schema: AdhocWitnessConfigSchema } }),
      await AdhocWitness.create({ account: Account.randomSync(), config: { name: 'PublicWitness3', schema: AdhocWitnessConfigSchema } }),
      await AdhocWitness.create({ account: Account.randomSync(), config: { name: 'PublicWitness4', schema: AdhocWitnessConfigSchema } }),
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
    const publicModules = await memoryNode.resolve('*')
    expect(publicModules).toBeArrayOfSize(7)
    /*const privateModules = await memoryNode.resolve('*', { visibility: 'private' })
    expect(privateModules).toBeArrayOfSize(3)
    const allModules = await memoryNode.resolve('*', { visibility: 'all' })
    expect(allModules).toBeArrayOfSize(8)*/

    const manifest = (await memoryNode.manifest()) as NodeManifestPayload
    //console.log(`manifest: ${toJsonString(manifest, 10)}`)
    expect(manifest.modules?.public ?? []).toBeArrayOfSize(4)
    //expect(manifest.modules?.private).toBeArrayOfSize(3)
  })
})
