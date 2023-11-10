import { HDWallet } from '@xyo-network/account'
import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { NodeManifest, PackageManifestPayload } from '@xyo-network/manifest-model'

import { ManifestWrapper } from '../ManifestWrapper'
import simpleNodeChildManifest from './simple-node-child.json'
import simpleNodeParentManifest from './simple-node-parent.json'

describe('Manifest', () => {
  describe('Create Node from Manifest', () => {
    test('Simple Node [Multi]', async () => {
      const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
      const wallet = await HDWallet.fromMnemonic(mnemonic)
      const manifest = new ManifestWrapper(simpleNodeParentManifest as PackageManifestPayload, wallet, undefined, [
        simpleNodeChildManifest as PackageManifestPayload,
      ])
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
