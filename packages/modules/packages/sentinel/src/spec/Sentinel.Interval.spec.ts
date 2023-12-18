import { HDWallet } from '@xyo-network/account'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { MemoryPayloadDiviner } from '@xyo-network/diviner-payload-memory'
import { ManifestWrapper, PackageManifest } from '@xyo-network/manifest'
import { ModuleFactoryLocator } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { AdhocWitness } from '@xyo-network/witness-adhoc'

import SentinelManifest from './Sentinel.Interval.spec.json'

/**
 * @group sentinel
 * @group module
 * @group slow
 */

describe('SentinelRunner', () => {
  let node: MemoryNode

  beforeAll(async () => {
    const wallet = await HDWallet.random()
    const locator = new ModuleFactoryLocator()
    locator.register(MemoryBoundWitnessDiviner)
    locator.register(MemoryPayloadDiviner)
    locator.register(AdhocWitness)
    const manifest = SentinelManifest as PackageManifest
    const manifestWrapper = new ManifestWrapper(manifest, wallet, locator)
    node = await manifestWrapper.loadNodeFromIndex(0)
    await node.start()

    const privateModules = manifest.nodes[0].modules?.private ?? []
    const publicModules = manifest.nodes[0].modules?.public ?? []
    const mods = await node.resolve()
    expect(mods.length).toBe(privateModules.length + publicModules.length + 1)
  })

  it('should output interval results', async () => {
    //
  })
})
