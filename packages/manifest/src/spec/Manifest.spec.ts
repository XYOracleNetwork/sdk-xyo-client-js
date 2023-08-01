import { HDWallet } from '@xyo-network/account'
import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { ManifestPayload } from '@xyo-network/manifest-model'

import { ManifestWrapper } from '../ManifestWrapper'
import simpleNodeInlineLazyManifest from './simple-node-inline-lazy-manifest.json'
import simpleNodeInlineManifest from './simple-node-inline-manifest.json'

describe('Manifest', () => {
  describe('Create Node from Manifest', () => {
    test('Simple Node [Inline]', async () => {
      const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
      const wallet = await HDWallet.fromMnemonic(mnemonic)
      const manifest = new ManifestWrapper(simpleNodeInlineManifest as ManifestPayload, wallet)
      const [node] = await manifest.loadNodes()
      expect(node).toBeDefined()
      const discover = await node.discover()
      const discoveredAddresses = discover.filter((item) => item.schema === AddressSchema)
      expect(discoveredAddresses.length).toBe(4)
      expect((await node.resolve()).length).toBeGreaterThan(10)
      const roundTrip = await node.manifest()
      expect(roundTrip.modules?.private).toBeArrayOfSize(1)
      expect(roundTrip.modules?.public?.length).toBeGreaterThan(10)
    })
  })
  describe('Create Node from Manifest [Lazy]', () => {
    test('Simple Node [Inline]', async () => {
      const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
      const wallet = await HDWallet.fromMnemonic(mnemonic)
      const manifest = new ManifestWrapper(simpleNodeInlineLazyManifest as ManifestPayload, wallet)
      const [node] = await manifest.loadNodes()
      expect(node).toBeDefined()
      const discover = await node.discover()
      const discoveredAddresses = discover.filter((item) => item.schema === AddressSchema)
      expect(discoveredAddresses.length).toBe(4)
      expect((await node.resolve()).length).toBeGreaterThan(10)
      const roundTrip = await node.manifest()
      expect(roundTrip.modules?.private).toBeArrayOfSize(1)
      expect(roundTrip.modules?.public?.length).toBeGreaterThan(10)
    })
  })
})
