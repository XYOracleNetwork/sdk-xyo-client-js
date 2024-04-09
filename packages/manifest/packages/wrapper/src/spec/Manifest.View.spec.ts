import { HDWallet } from '@xyo-network/account'
import { PackageManifestPayload } from '@xyo-network/manifest-model'
import { asNodeInstance } from '@xyo-network/node-model'

import { ManifestWrapper } from '../Wrapper'
import simpleNodeViewManifest from './simple-node-view-manifest.json'

describe('Manifest', () => {
  describe('Create Node from Manifest', () => {
    test('Simple Node [Inline]', async () => {
      const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
      const wallet = await HDWallet.fromPhrase(mnemonic)
      const manifest = new ManifestWrapper(simpleNodeViewManifest as PackageManifestPayload, wallet)
      const [node] = await manifest.loadNodes()
      expect(node).toBeDefined()

      const viewNode = asNodeInstance(await node.resolve('ViewNode'))
      const sharedMod = await viewNode?.resolve('SimpleArchivist')
      expect(sharedMod).toBeDefined()

      const notSharedMod = await viewNode?.resolve('SimpleSentinel')
      expect(notSharedMod).toBeUndefined()
    })
  })
})
