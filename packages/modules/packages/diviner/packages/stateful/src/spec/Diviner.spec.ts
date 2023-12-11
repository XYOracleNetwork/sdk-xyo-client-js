import { assertEx } from '@xylabs/assert'
import { HDWallet } from '@xyo-network/account'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { IndexingDivinerState } from '@xyo-network/diviner-indexing-model'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { MemoryPayloadDiviner } from '@xyo-network/diviner-payload-memory'
import { ManifestWrapper, PackageManifest } from '@xyo-network/manifest'
import { MemoryArchivist } from '@xyo-network/memory-archivist'
import { isModuleState, ModuleFactoryLocator, ModuleState, ModuleStateSchema } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { Payload } from '@xyo-network/payload-model'

import { StatefulDiviner } from '../Diviner'
import TestManifest from './TestManifest.json'

class TestStatefulDiviner extends StatefulDiviner {
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

    sut = assertEx(asDivinerInstance<TestStatefulDiviner>(await node.resolve('TestStatefulDiviner')))
  })

  describe('divine', () => {
    describe('with no previous state', () => {
      it('return state and no results', async () => {
        const results = await sut.divine()
        expect(results.length).toBe(1)
        const state = results.find(isModuleState<IndexingDivinerState>)
        expect(state).toBeDefined()
        expect(state?.state.offset).toBe(0)
      })
    })
    describe('with previous state', () => {
      // Test across all offsets
      const states: ModuleState<IndexingDivinerState>[] = witnessedThumbnails.map((_, offset) => {
        return { schema: ModuleStateSchema, state: { offset } }
      })
      it.each(states)('return next state and batch results', async (lastState) => {
        const results = await sut.divine([lastState])

        // Validate expected results length
        const expectedIndividualResults = witnessedThumbnails.length - lastState.state.offset
        // expectedIndividualResults * 3 [BW, ImageThumbnail, TimeStamp] + 1 [ModuleState]
        const expectedResults = expectedIndividualResults * 3 + 1
        expect(results.length).toBe(expectedResults)

        // Validate expected state
        const nextState = results.find(isModuleState<IndexingDivinerState>)
        expect(nextState).toBeDefined()
        expect(nextState?.state.offset).toBe(witnessedThumbnails.length)

        // Validate expected individual results
        // const bws = results.filter(isBoundWitness)
        // expect(bws).toBeArrayOfSize(expectedIndividualResults)
        // const images = results.filter(isImageThumbnail)
        // expect(images).toBeArrayOfSize(expectedIndividualResults)
        // const timestamps = results.filter(isTimestamp)
        // expect(timestamps).toBeArrayOfSize(expectedIndividualResults)
      })
    })
  })
})
