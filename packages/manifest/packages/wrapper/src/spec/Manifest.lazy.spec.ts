import '@xylabs/vitest-extended'

import type { NodeManifest, PackageManifestPayload } from '@xyo-network/manifest-model'
import { ModuleFactoryLocator } from '@xyo-network/module-factory-locator'
import { AddressSchema } from '@xyo-network/module-model'
import { HDWallet } from '@xyo-network/wallet'
import {
  describe, expect, test,
} from 'vitest'

import { ManifestWrapper } from '../Wrapper.ts'
import simpleNodeInlineLazyManifest from './simple-node-inline-lazy-manifest.json' with { type: 'json' }

describe('Manifest', () => {
  describe('Create Node from Manifest [Lazy]', () => {
    test('Simple Node [Inline]', async () => {
      const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
      const wallet = await HDWallet.fromPhrase(mnemonic)
      const manifest = new ManifestWrapper(simpleNodeInlineLazyManifest as PackageManifestPayload, wallet, new ModuleFactoryLocator())
      const [node] = await manifest.loadNodes()
      expect(node).toBeDefined()
      const discover = await node.state()
      // console.log(`discover: ${toJsonString(discover)}`)
      const discoveredAddresses = discover.filter(item => item.schema === AddressSchema)
      expect(discoveredAddresses.length).toBe(4)
      // expect((await node.resolve()).length).toBeGreaterThan(10)
      const roundTrip = (await node.manifest()) as NodeManifest
      // console.log(`roundTrip: ${toJsonString(roundTrip)}`)
      // expect(roundTrip.modules?.private).toBeArrayOfSize(1)
      expect(roundTrip.modules?.public?.length).toBe(3)
    })
  })
})
