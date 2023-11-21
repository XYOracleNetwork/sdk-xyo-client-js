import { HDWallet } from '@xyo-network/account'
import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { NodeManifest, PackageManifestPayload } from '@xyo-network/manifest-model'

import { ManifestWrapper } from '../ManifestWrapper'
import simpleNodeInlineLazyManifest from './simple-node-inline-lazy-manifest.json'

describe('Manifest', () => {
  describe('Create Node from Manifest [Lazy]', () => {
    test('Simple Node [Inline]', async () => {
      const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
      const wallet = await HDWallet.fromPhrase(mnemonic)
      const manifest = new ManifestWrapper(simpleNodeInlineLazyManifest as PackageManifestPayload, wallet)
      const [node] = await manifest.loadNodes()
      expect(node).toBeDefined()
      const discover = await node.discover()
      const discoveredAddresses = discover.filter((item) => item.schema === AddressSchema)
      expect(discoveredAddresses.length).toBe(4)
      expect((await node.resolve()).length).toBeGreaterThan(10)
      const roundTrip = (await node.manifest()) as NodeManifest
      //expect(roundTrip.modules?.private).toBeArrayOfSize(1)
      expect(roundTrip.modules?.public?.length).toBeGreaterThan(10)
    })
  })
})
