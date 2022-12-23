import { assertEx } from '@xylabs/assert'
import { XyoArchivistApi } from '@xyo-network/api'
import { XyoApiConfig } from '@xyo-network/api-models'
import { ModuleWrapper } from '@xyo-network/module'
import { Module } from '@xyo-network/module-model'
import { NodeConfig, NodeConfigSchema } from '@xyo-network/node'

import { RemoteNode } from './RemoteNode'

const apiConfig: XyoApiConfig = { apiDomain: process.env.API_DOMAIN || 'http://localhost:8080' }
const config: NodeConfig = { schema: NodeConfigSchema }
const name = 'PayloadDiviner'

describe('RemoteNode', () => {
  let sut: RemoteNode
  beforeAll(async () => {
    sut = await RemoteNode.create({ apiConfig, config })
    expect(sut).toBeTruthy()
  })
  describe('discover', () => {
    it('discovers', async () => {
      const response = await sut.discover()
      expect(response).toBeTruthy()
    })
  })
  describe('tryResolve', () => {
    const validateModuleResolutionResponse = async (mods: Module[]) => {
      expect(mods).toBeArray()
      expect(mods.length).toBe(1)
      const mod = assertEx(mods.pop())
      const wrapped = new ModuleWrapper(mod)
      const response = await wrapped.discover()
      expect(response).toBeTruthy()
    }
    it('resolves by name', async () => {
      const mods = await sut.tryResolve({ name: [name] })
      await validateModuleResolutionResponse(mods)
    })
    it('resolves by address', async () => {
      const api = new XyoArchivistApi(apiConfig)
      const response = await api.get()
      expect(response).toBeTruthy()
      expect(response?.address).toBeString()
      const address = assertEx(response?.address)
      const mods = await sut.tryResolve({ address: [address] })
      await validateModuleResolutionResponse(mods)
    })
  })
})
