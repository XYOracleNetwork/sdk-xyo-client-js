import '@xylabs/vitest-extended'

import type {
  ModuleManifest, NodeManifest, PackageManifestPayload,
} from '@xyo-network/manifest-model'
import { ModuleFactoryLocator } from '@xyo-network/module-factory-locator'
import { AddressSchema } from '@xyo-network/module-model'
import { HDWallet } from '@xyo-network/wallet'
import {
  describe, expect, test,
} from 'vitest'

import { ManifestWrapper } from '../Wrapper.ts'
import simpleNodeChildManifest from './simple-node-child.json' with { type: 'json' }
import simpleNodeParentManifest from './simple-node-parent.json' with { type: 'json' }

describe('Manifest', () => {
  describe('Create Node from Manifest', () => {
    test('Simple Node [Multi]', async () => {
      const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
      const wallet = await HDWallet.fromPhrase(mnemonic)
      const manifest = new ManifestWrapper(
        simpleNodeParentManifest as PackageManifestPayload,
        wallet,
        new ModuleFactoryLocator(),
        simpleNodeChildManifest.nodes[0].modules.public as ModuleManifest[],
      )
      const [node] = await manifest.loadNodes()
      expect(node).toBeDefined()
      const state = await node.state()
      const discoveredAddresses = state.filter(item => item.schema === AddressSchema)
      expect(discoveredAddresses.length).toBeGreaterThan(7)
      // expect((await node.resolve()).length).toBeGreaterThan(10)
      const roundTrip = (await node.manifest()) as NodeManifest
      // expect(roundTrip.modules?.private).toBeArrayOfSize(1)
      expect(roundTrip.modules?.public).toBeArrayOfSize(6)
    })
  })
})
