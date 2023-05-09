import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { NodeWrapper } from '@xyo-network/node'

import { ManifestWrapper } from '../ManifestWrapper'
import { ManifestPayload } from '../Payload'
import simpleNodeIndirectManifest from './simple-node-indirect-manifest.json'
import simpleNodeInlineManifest from './simple-node-inline-manifest.json'

describe('Manifest', () => {
  describe('Create Node from Manifest', () => {
    test('Simple Node [Indirect]', async () => {
      const manifest = new ManifestWrapper(simpleNodeIndirectManifest as ManifestPayload)
      const [node] = await manifest.loadDapps()
      expect(node).toBeDefined()
      const wrapper = NodeWrapper.wrap(node)
      const discover = await wrapper.discover()
      const discoveredAddresses = discover.filter((item) => item.schema === AddressSchema)
      expect(discoveredAddresses).toBeArrayOfSize(4)
      expect(await node.downResolver.resolve()).toBeArrayOfSize(3)
    })
    test('Simple Node [Inline]', async () => {
      const manifest = new ManifestWrapper(simpleNodeInlineManifest as ManifestPayload)
      const [node] = await manifest.loadDapps()
      expect(node).toBeDefined()
      const wrapper = NodeWrapper.wrap(node)
      const discover = await wrapper.discover()
      const discoveredAddresses = discover.filter((item) => item.schema === AddressSchema)
      expect(discoveredAddresses).toBeArrayOfSize(4)
      expect(await node.downResolver.resolve()).toBeArrayOfSize(3)
    })
  })
})
