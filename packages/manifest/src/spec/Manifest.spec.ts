import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { NodeWrapper } from '@xyo-network/node'

import { ManifestWrapper } from '../ManifestWrapper'
import { ManifestPayload } from '../Payload'
import simpleNodeManifest from './simple-node-manifest.json'

describe('Manifest', () => {
  describe('Create Node from Manifest', () => {
    test('Manifest 1 - Simple Node', async () => {
      const manifest = new ManifestWrapper(simpleNodeManifest as ManifestPayload)
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
