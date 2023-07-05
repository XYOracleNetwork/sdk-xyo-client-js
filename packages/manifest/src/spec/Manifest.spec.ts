import { HDWallet } from '@xyo-network/account'
import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { ManifestPayload } from '@xyo-network/manifest-model'
import { NodeWrapper } from '@xyo-network/node'

import { ManifestWrapper } from '../ManifestWrapper'
import simpleNodeInlineManifest from './simple-node-inline-manifest.json'

describe('Manifest', () => {
  describe('Create Node from Manifest', () => {
    test('Simple Node [Inline]', async () => {
      const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
      const wallet = await HDWallet.fromMnemonic(mnemonic)
      const manifest = new ManifestWrapper(simpleNodeInlineManifest as ManifestPayload, wallet)
      const [node] = await manifest.loadNodes()
      expect(node).toBeDefined()
      const wrapper = NodeWrapper.wrap(node)
      const discover = await wrapper.discover()
      const discoveredAddresses = discover.filter((item) => item.schema === AddressSchema)
      expect(discoveredAddresses).toBeArrayOfSize(4)
      expect(await node.downResolver.resolve()).toBeArrayOfSize(3)
    })
  })
})
