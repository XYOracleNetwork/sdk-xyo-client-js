import '@xylabs/vitest-extended'

import type { NodeManifestPayload } from '@xyo-network/manifest-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { AdhocWitness, AdhocWitnessConfigSchema } from '@xyo-network/witness-adhoc'
import {
  describe, expect, it,
} from 'vitest'

/**
 * @group node
 * @group module
 */

describe('MemoryNode', () => {
  // AbstractModule.defaultLogger = new ConsoleLogger(LogLevel.log)
  it('Creates MemoryNode from Manifest', async () => {
    const memoryNode = await MemoryNode.create({
      account: 'random',
      config: { name: 'MemoryNode', schema: 'network.xyo.node.config' },
    })
    const privateWitnesses = [
      await AdhocWitness.create({ account: 'random', config: { name: 'PrivateWitness1', schema: AdhocWitnessConfigSchema } }),
      await AdhocWitness.create({ account: 'random', config: { name: 'PrivateWitness2', schema: AdhocWitnessConfigSchema } }),
      await AdhocWitness.create({ account: 'random', config: { name: 'PrivateWitness3', schema: AdhocWitnessConfigSchema } }),
    ]
    const publicWitnesses = [
      await AdhocWitness.create({ account: 'random', config: { name: 'PublicWitness1', schema: AdhocWitnessConfigSchema } }),
      await AdhocWitness.create({ account: 'random', config: { name: 'PublicWitness2', schema: AdhocWitnessConfigSchema } }),
      await AdhocWitness.create({ account: 'random', config: { name: 'PublicWitness3', schema: AdhocWitnessConfigSchema } }),
      await AdhocWitness.create({ account: 'random', config: { name: 'PublicWitness4', schema: AdhocWitnessConfigSchema } }),
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
    expect(publicModules).toBeArrayOfSize(8)
    /* const privateModules = await memoryNode.resolve('*', { visibility: 'private' })
    expect(privateModules).toBeArrayOfSize(3)
    const allModules = await memoryNode.resolve('*', { visibility: 'all' })
    expect(allModules).toBeArrayOfSize(8) */

    const manifest = (await memoryNode.manifest()) as NodeManifestPayload
    // console.log(`manifest: ${toJsonString(manifest, 10)}`)
    expect(manifest.modules?.public ?? []).toBeArrayOfSize(4)
    // expect(manifest.modules?.private).toBeArrayOfSize(3)
  })
})
