import { assertEx } from '@xylabs/assert'
import { XyoArchivistApi } from '@xyo-network/api'
import { XyoApiConfig } from '@xyo-network/api-models'
import { ModuleWrapper } from '@xyo-network/module'
import { Module } from '@xyo-network/module-model'
import { AbstractNodeParams, MemoryNode, NodeConfigSchema } from '@xyo-network/node'

import { RemoteModuleResolver } from './RemoteModuleResolver'

const apiConfig: XyoApiConfig = { apiDomain: process.env.API_DOMAIN || 'http://localhost:8080' }
const name = 'PayloadDiviner'

describe('RemoteModuleResolver', () => {
  let resolver: RemoteModuleResolver
  let address = ''
  beforeAll(async () => {
    resolver = new RemoteModuleResolver(apiConfig)
    const api = new XyoArchivistApi(apiConfig)
    const response = await api.get()
    expect(response).toBeTruthy()
    expect(response?.address).toBeString()
    address = assertEx(response?.address)
  })
  describe('tryResolve', () => {
    it('resolves by name', async () => {
      const mods = await resolver.tryResolve({ name: [name] })
      await validateModuleResolutionResponse(mods)
    })
    it('resolves by address', async () => {
      const mods = await resolver.tryResolve({ address: [address] })
      await validateModuleResolutionResponse(mods)
    })
  })
  describe('when used with MemoryNode', () => {
    let node: MemoryNode
    const config = { schema: NodeConfigSchema }
    beforeAll(async () => {
      const params: AbstractNodeParams = { config, internalResolver: resolver }
      node = await MemoryNode.create(params)
    })
    it('resolves by name', async () => {
      const mods = await node.tryResolve({ name: [name] })
      await validateModuleResolutionResponse(mods)
    })
    it('resolves by address', async () => {
      const mods = await node.tryResolve({ address: [address] })
      await validateModuleResolutionResponse(mods)
    })
  })
})

const validateModuleResolutionResponse = async (mods: Module[]) => {
  expect(mods).toBeArray()
  expect(mods.length).toBe(1)
  const mod = assertEx(mods.pop())
  const wrapped = new ModuleWrapper(mod)
  const response = await wrapped.discover()
  expect(response).toBeTruthy()
}
