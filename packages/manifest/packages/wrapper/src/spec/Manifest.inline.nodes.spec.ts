import '@xylabs/vitest-extended'

import { delay, toSafeJsonString } from '@xylabs/sdk-js'
import type { NodeManifest, PackageManifestPayload } from '@xyo-network/manifest-model'
// import { AbstractModule } from '@xyo-network/module-abstract'
import { ModuleFactoryLocator } from '@xyo-network/module-factory-locator'
import { AddressSchema } from '@xyo-network/module-model'
import { HDWallet } from '@xyo-network/wallet'
import {
  describe, expect, test,
} from 'vitest'

import { ManifestWrapper } from '../Wrapper.ts'
import simpleNodeInlineNodesManifest from './simple-node-inline-nodes-manifest.json' with { type: 'json' }

// AbstractModule.defaultLogger = console

describe('Manifest (Inline Nodes)', () => {
  describe('Create Node from Manifest', () => {
    test('Simple Node [Inline with Nodes]', { timeout: 10_000 }, async () => {
      const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
      const wallet = await HDWallet.fromPhrase(mnemonic)
      const manifest = new ManifestWrapper(simpleNodeInlineNodesManifest as PackageManifestPayload, wallet, new ModuleFactoryLocator())
      const [node] = await manifest.loadNodes()
      expect(node).toBeDefined()
      expect(node.name).toBe('SimpleMemoryDapp')

      const discover = await node.state()
      const discoveredAddresses = discover.filter(item => item.schema === AddressSchema)
      expect(discoveredAddresses.length).toBe(5)
      // expect((await node.resolve()).length).toBeGreaterThan(4)

      const roundTrip = (await node.manifest()) as NodeManifest
      const node2SimpleDiviner = await node.resolve('Node2SimpleDiviner')
      expect(node2SimpleDiviner).toBeDefined()
      let divineStartCount = 0
      let divineEndCount = 0
      node2SimpleDiviner?.on('divineStart', () => {
        divineStartCount++
      })
      node2SimpleDiviner?.on('divineEnd', () => {
        divineEndCount++
      })
      console.log(`manifest: ${toSafeJsonString(roundTrip, 20)}`)
      await delay(5000)
      expect(divineStartCount).toBeGreaterThan(0)
      expect(divineEndCount).toBeGreaterThan(0)
      // expect(roundTrip.modules?.private).toBeArrayOfSize(1)
      expect(roundTrip.modules?.public).toBeArrayOfSize(1)
    })
  })
})
