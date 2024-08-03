import { assertEx } from '@xylabs/assert'
import { HDWallet } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { MemoryPayloadDiviner } from '@xyo-network/diviner-payload-memory'
import { ManifestWrapper, PackageManifestPayload } from '@xyo-network/manifest'
import { ModuleFactoryLocator } from '@xyo-network/module-factory-locator'
import { ModuleState } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, WithMeta } from '@xyo-network/payload-model'

import { StatefulDiviner } from '../Diviner.ts'
import TestManifest from './TestManifest.json'

class TestStatefulDiviner extends StatefulDiviner {
  callCommitState(state: WithMeta<ModuleState>) {
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
    const manifest = TestManifest as PackageManifestPayload
    const manifestWrapper = new ManifestWrapper(manifest, wallet, locator)
    node = await manifestWrapper.loadNodeFromIndex(0)
    await node.start()

    const privateModules = manifest.nodes[0].modules?.private ?? []
    const publicModules = manifest.nodes[0].modules?.public ?? []
    const mods = await node.resolve('*')
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
        await sut.callCommitState(await PayloadBuilder.build(state))
        const results = await sut.callRetrieveState()
        expect(results).toMatchObject(state)
      })
    })
  })
})
