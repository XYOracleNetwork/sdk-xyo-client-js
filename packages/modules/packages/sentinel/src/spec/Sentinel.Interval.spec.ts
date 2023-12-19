import { delay } from '@xylabs/delay'
import { HDWallet } from '@xyo-network/account'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { JsonPatchDiviner } from '@xyo-network/diviner-jsonpatch-memory'
import { JsonPathAggregateDiviner } from '@xyo-network/diviner-jsonpath-aggregate-memory'
import { JsonPathDiviner } from '@xyo-network/diviner-jsonpath-memory'
import { asDivinerInstance } from '@xyo-network/diviner-model'
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

describe.skip('Sentinel.Interval', () => {
  let node: MemoryNode

  beforeAll(async () => {
    const wallet = await HDWallet.random()
    const locator = new ModuleFactoryLocator()
    locator.register(MemoryBoundWitnessDiviner)
    locator.register(MemoryPayloadDiviner)
    locator.register(JsonPatchDiviner)
    locator.register(JsonPathDiviner)
    locator.register(JsonPathAggregateDiviner)
    locator.register(AdhocWitness)
    const manifest = SentinelManifest as PackageManifest
    const manifestWrapper = new ManifestWrapper(manifest, wallet, locator)
    node = await manifestWrapper.loadNodeFromIndex(0)
    await node.start()

    const publicModules = manifest.nodes[0].modules?.public ?? []
    const mods = await node.resolve()
    expect(mods.length).toBe(publicModules.length + 1)

    // Add some test data
    const testPayloads = [
      {
        schema: 'network.xyo.test',
        value: 1,
      },
      {
        schema: 'network.xyo.test',
        value: 2,
      },
    ]
    const archivist = asArchivistInstance(await node.resolve('Archivist'))
    await archivist?.insert(testPayloads)
  })

  it('sentinel query', async () => {
    await delay(2000)
    const archivist = asArchivistInstance(await node.resolve('Results'))
    expect(archivist).toBeDefined()
    const payloads = (await archivist?.all?.()) ?? []
    expect(payloads.length).toBeGreaterThan(0)
    expect(payloads.some((p) => p.schema === 'network.xyo.test')).toBeTrue()
  })
  it.skip('manual query', async () => {
    const testPayloads = [
      {
        schema: 'network.xyo.test',
        value: 1,
      },
      {
        schema: 'network.xyo.test',
        value: 2,
      },
    ]
    const archivist = asArchivistInstance(await node.resolve('Archivist'))
    await archivist?.insert(testPayloads)
    // const addressStateArchivist = asArchivistInstance(await node.resolve('AddressStateArchivist'))
    // const addressStateBoundWitnessDiviner = asDivinerInstance(await node.resolve('AddressStateBoundWitnessDiviner'))
    const addressStatePayloadDiviner = asDivinerInstance(await node.resolve('AddressStatePayloadDiviner'))
    const lastStateQuery = {
      limit: 1,
      offset: 0,
      order: 'desc',
      schema: 'network.xyo.diviner.payload.query',
      // schema: 'network.xyo.diviner.boundwitness.query',
      // payload_schemas: ['network.xyo.module.state'],
      schemas: ['network.xyo.module.state'],
    }
    const initialState = await addressStatePayloadDiviner?.divine([lastStateQuery])
    const statePayloads = initialState?.filter((p): p is { offset?: number; schema: string } => p.schema === 'network.xyo.module.state') ?? []
    const offset = statePayloads?.[0]?.offset ?? 0
    const payloadDiviner = asDivinerInstance(await node.resolve('PayloadDiviner'))
    const payloadDivinerQuery = {
      limit: 1,
      offset,
      order: 'asc',
      schema: 'network.xyo.diviner.payload.query',
      schemas: ['network.xyo.test'],
    }
    const payloadBatch = await payloadDiviner?.divine([payloadDivinerQuery])
    expect(payloadBatch?.length).toBe(1)
  })
})
