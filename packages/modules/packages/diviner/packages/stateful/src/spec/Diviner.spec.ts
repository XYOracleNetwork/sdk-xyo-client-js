import { assertEx } from '@xylabs/assert'
import { HDWallet } from '@xyo-network/account'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { MemoryPayloadDiviner } from '@xyo-network/diviner-payload-memory'
import { ManifestWrapper, PackageManifest } from '@xyo-network/manifest'
import { MemoryArchivist } from '@xyo-network/memory-archivist'
import { ModuleFactoryLocator, ModuleState } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { Payload } from '@xyo-network/payload-model'

import { StatefulDiviner } from '../Diviner'
import TestManifest from './TestManifest.json'

class TestStatefulDiviner extends StatefulDiviner {
  callCommitState(state: ModuleState) {
    return this.commitState(state)
  }
  callRetrieveState() {
    return this.retrieveState()
  }
  protected override divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    return Promise.resolve(payloads ?? [])
  }
}

/**
 * @group slow
 */
describe('TestStatefulDiviner', () => {
  let sut: TestStatefulDiviner
  let node: MemoryNode

  beforeAll(async () => {
    const wallet = await HDWallet.random()
    const locator = new ModuleFactoryLocator()
    locator.register(MemoryArchivist)
    locator.register(MemoryBoundWitnessDiviner)
    locator.register(MemoryPayloadDiviner)
    locator.register(TestStatefulDiviner)
    const manifest = TestManifest as PackageManifest
    const manifestWrapper = new ManifestWrapper(manifest, wallet, locator)
    node = await manifestWrapper.loadNodeFromIndex(0)
    await node.start()

    const privateModules = manifest.nodes[0].modules?.private ?? []
    const publicModules = manifest.nodes[0].modules?.public ?? []
    const mods = await node.resolve()
    expect(mods.length).toBe(privateModules.length + publicModules.length + 1)

    sut = assertEx(asDivinerInstance<TestStatefulDiviner>(await node.resolve('Diviner')))
  })

  describe('divine', () => {
    describe('with no previous state', () => {
      it('returns undefined', async () => {
        const results = await sut.callRetrieveState()
        expect(results).toBeUndefined()
      })
    })
    describe('with previous state', () => {
      const cases: ModuleState[] = [
        { schema: 'network.xyo.module.state', state: { offset: 0 } },
        { schema: 'network.xyo.module.state', state: { offset: 1 } },
        { schema: 'network.xyo.module.state', state: { offset: 1000 } },
      ]

      it.each(cases)('returns state', async (state) => {
        await sut.callCommitState(state)
        const results = await sut.callRetrieveState()
        expect(results).toBe(state)
      })
    })
  })
})
