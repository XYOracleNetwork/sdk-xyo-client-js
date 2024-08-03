import { toJsonString } from '@xylabs/object'
import { HDWallet } from '@xyo-network/account'
import { NodeManifest, PackageManifestPayload } from '@xyo-network/manifest-model'
import { AddressSchema } from '@xyo-network/module-model'

import { ManifestWrapper } from '../Wrapper.ts'
import simpleNodeInlineManifest from './simple-node-inline-manifest.json'

describe('Manifest', () => {
  describe('Create Node from Manifest', () => {
    test('Simple Node [Inline]', async () => {
      const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
      const wallet = await HDWallet.fromPhrase(mnemonic)
      const manifest = new ManifestWrapper(simpleNodeInlineManifest as PackageManifestPayload, wallet)
      const [node] = await manifest.loadNodes()
      expect(node).toBeDefined()

      const discover = await node.state()
      const discoveredAddresses = discover.filter(item => item.schema === AddressSchema)
      expect(discoveredAddresses.length).toBeGreaterThan(4)
      // expect((await node.resolve()).length).toBeGreaterThan(4)

      const roundTrip = (await node.manifest()) as NodeManifest
      console.log(`manifest: ${toJsonString(roundTrip, 20)}`)
      // expect(roundTrip.modules?.private).toBeArrayOfSize(1)
      expect(roundTrip.modules?.public).toBeArrayOfSize(3)
    })
  })
})
