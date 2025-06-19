import '@xylabs/vitest-extended'

import { toJsonString } from '@xylabs/object'
import type { NodeManifest, PackageManifestPayload } from '@xyo-network/manifest-model'
import { ModuleFactoryLocator } from '@xyo-network/module-factory-locator'
import { AddressSchema } from '@xyo-network/module-model'
import { HDWallet } from '@xyo-network/wallet'
import {
  describe, expect, test,
} from 'vitest'

import { ManifestWrapper } from '../Wrapper.ts'
import simpleNodeInlineNodesManifest from './simple-node-inline-nodes-manifest.json' with { type: 'json' }

describe('Manifest (Inline Nodes)', () => {
  describe('Create Node from Manifest', () => {
    test('Simple Node [Inline with Nodes]', async () => {
      const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
      const wallet = await HDWallet.fromPhrase(mnemonic)
      const manifest = new ManifestWrapper(simpleNodeInlineNodesManifest as PackageManifestPayload, wallet, new ModuleFactoryLocator())
      const [node] = await manifest.loadNodes()
      expect(node).toBeDefined()

      const discover = await node.state()
      const discoveredAddresses = discover.filter(item => item.schema === AddressSchema)
      expect(discoveredAddresses.length).toBe(4)
      // expect((await node.resolve()).length).toBeGreaterThan(4)

      const roundTrip = (await node.manifest()) as NodeManifest
      console.log(`manifest: ${toJsonString(roundTrip, 20)}`)
      // expect(roundTrip.modules?.private).toBeArrayOfSize(1)
      expect(roundTrip.modules?.public).toBeArrayOfSize(1)
    })
  })
})
