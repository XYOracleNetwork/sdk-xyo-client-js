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
      console.log(`Node: ${node.address}`)
      console.log(`Discover: ${JSON.stringify(discover, null, 2)}`)
      console.log(
        `Down: ${JSON.stringify(
          (await node.downResolver.resolve()).map((module) => `${module.config.schema} [${module.address}]`),
          null,
          2,
        )}`,
      )
      console.log(
        `Up: ${JSON.stringify(
          (await node.upResolver.resolve()).map((module) => `${module.config.schema} [${module.address}]`),
          null,
          2,
        )}`,
      )
      console.log(
        `Resolve: ${JSON.stringify(
          (await wrapper.resolve()).map((module) => `${module.config.schema} [${module.address}]`),
          null,
          2,
        )}`,
      )
      expect(discover).toBeDefined()
    })
  })
})
