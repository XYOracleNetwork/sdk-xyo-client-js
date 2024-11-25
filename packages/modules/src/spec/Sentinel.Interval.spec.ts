import '@xylabs/vitest-extended'

import { delay } from '@xylabs/delay'
import { HDWallet } from '@xyo-network/account'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { JsonPatchDiviner } from '@xyo-network/diviner-jsonpatch-memory'
import { JsonPathAggregateDiviner } from '@xyo-network/diviner-jsonpath-aggregate-memory'
import { JsonPathDiviner } from '@xyo-network/diviner-jsonpath-memory'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import type { PackageManifestPayload } from '@xyo-network/manifest'
import { ManifestWrapper } from '@xyo-network/manifest'
import { ModuleFactoryLocator } from '@xyo-network/module-factory-locator'
import type { MemoryNode } from '@xyo-network/node-memory'
import type { WithMeta } from '@xyo-network/payload-model'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import SentinelManifest from './Sentinel.Interval.spec.json' assert {type: 'json'}

/**
 * @group sentinel
 * @group module
 * @group slow
 */

const NETWORK_XYO_TEST = 'network.xyo.test' as const

describe('Sentinel.Interval', () => {
  let node: MemoryNode

  beforeAll(async () => {
    const wallet = await HDWallet.random()
    const locator = new ModuleFactoryLocator()
    locator.register(JsonPatchDiviner)
    locator.register(JsonPathDiviner)
    locator.register(JsonPathAggregateDiviner)
    const manifest = SentinelManifest as PackageManifestPayload
    const manifestWrapper = new ManifestWrapper(manifest, wallet, locator)
    node = await manifestWrapper.loadNodeFromIndex(0)
    await node.start()

    const publicModules = manifest.nodes[0].modules?.public ?? []
    const mods = await node.resolve('*')
    expect(mods.length).toBe(publicModules.length + 1)

    // Add some test data
    const testPayloads = [
      {
        schema: NETWORK_XYO_TEST,
        value: 1,
      },
      {
        schema: NETWORK_XYO_TEST,
        value: 2,
      },
    ]
    const archivist = asArchivistInstance(await node.resolve('Archivist'))
    await archivist?.insert(testPayloads)
  })

  it('sentinel query', async () => {
    await delay(5000)
    const archivist = asArchivistInstance(await node.resolve('Results'))
    expect(archivist).toBeDefined()
    const payloads = (await archivist?.all?.()) ?? []
    expect(payloads.length).toBeGreaterThan(0)
    // console.log(`payloads: ${JSON.stringify(payloads, null, 2)}`)
    expect(payloads.some(p => p.schema === NETWORK_XYO_TEST)).toBeTrue()
  }, 20_000)
  it.skip('manual query', async () => {
    const testPayloads = [
      {
        schema: NETWORK_XYO_TEST,
        value: 1,
      },
      {
        schema: NETWORK_XYO_TEST,
        value: 2,
      },
    ]
    const archivist = asArchivistInstance(await node.resolve('Archivist'))
    expect(archivist).toBeDefined()
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
    const statePayloads
      = initialState?.filter((p): p is WithMeta<{ offset?: number; schema: string }> => p.schema === 'network.xyo.module.state') ?? []
    const offset = statePayloads?.[0]?.offset ?? 0
    const payloadDiviner = asDivinerInstance(await node.resolve('PayloadDiviner'))
    const payloadDivinerQuery = {
      limit: 1,
      offset,
      order: 'asc',
      schema: 'network.xyo.diviner.payload.query',
      schemas: [NETWORK_XYO_TEST],
    }
    const payloadBatch = await payloadDiviner?.divine([payloadDivinerQuery])
    expect(payloadBatch?.length).toBe(1)
  })
})
