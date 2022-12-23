import { XyoApiConfig } from '@xyo-network/api-models'
import { NodeConfig, NodeConfigSchema } from '@xyo-network/node'

import { RemoteNode } from './RemoteNode'

const apiConfig: XyoApiConfig = { apiDomain: process.env.API_DOMAIN || 'http://localhost:8080' }
const config: NodeConfig = { schema: NodeConfigSchema }
const name = 'PayloadDiviner'

describe('RemoteNode', () => {
  describe('create', () => {
    it('creates module', async () => {
      const mod = await RemoteNode.create({ apiConfig, config })
      expect(mod).toBeTruthy()
    })
  })
})
