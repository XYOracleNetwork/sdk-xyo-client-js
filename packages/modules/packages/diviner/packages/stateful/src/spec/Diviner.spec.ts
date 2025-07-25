import '@xylabs/vitest-extended'

import { assertEx } from '@xylabs/assert'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { GenericPayloadDiviner } from '@xyo-network/diviner-payload-generic'
import type { PackageManifestPayload } from '@xyo-network/manifest'
import { ManifestWrapper } from '@xyo-network/manifest'
import { ModuleFactoryLocator } from '@xyo-network/module-factory-locator'
import {
  creatableModule, CreatableModuleInstance, type ModuleState,
} from '@xyo-network/module-model'
import type { MemoryNode } from '@xyo-network/node-memory'
import type { Payload } from '@xyo-network/payload-model'
import { HDWallet } from '@xyo-network/wallet'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import { StatefulDiviner } from '../Diviner.ts'
import { StatefulDivinerParams } from '../Params.ts'
import TestManifest from './TestManifest.json' with { type: 'json' }

@creatableModule<CreatableModuleInstance<StatefulDivinerParams>>()
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
    locator.register(MemoryArchivist.factory())
    locator.register(MemoryBoundWitnessDiviner.factory())
    locator.register(GenericPayloadDiviner.factory())
    locator.register(TestStatefulDiviner.factory())
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
        await sut.callCommitState(state)
        const results = await sut.callRetrieveState()
        expect(results).toMatchObject(state)
      })
    })
  })
})
