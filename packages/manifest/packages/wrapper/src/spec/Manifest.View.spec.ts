import '@xylabs/vitest-extended'

import { HDWallet } from '@xyo-network/account'
import type { PackageManifestPayload } from '@xyo-network/manifest-model'
import {
  asNodeInstance, isNodeInstance, isNodeModule,
} from '@xyo-network/node-model'
import {
  describe, expect, test,
} from 'vitest'

import { ManifestWrapper } from '../Wrapper.ts'
import simpleNodeViewManifest from './simple-node-view-manifest.json' with {type: 'json'}

describe('Manifest', () => {
  describe('Create Node from Manifest', () => {
    test('Simple Node [Inline]', async () => {
      const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
      const wallet = await HDWallet.fromPhrase(mnemonic)
      const manifest = new ManifestWrapper(simpleNodeViewManifest as PackageManifestPayload, wallet)
      const [node] = await manifest.loadNodes()
      expect(node).toBeDefined()

      const viewNode = asNodeInstance(await node.resolve('ViewNode'))
      expect(isNodeModule(viewNode)).toBe(true)
      expect(isNodeInstance(viewNode)).toBe(true)
      const sharedMod = await viewNode?.resolve('SimpleArchivist')
      expect(sharedMod).toBeDefined()

      const notSharedMod = await viewNode?.resolve('SimpleSentinel')
      expect(notSharedMod).toBeUndefined()
    })
  })
})
