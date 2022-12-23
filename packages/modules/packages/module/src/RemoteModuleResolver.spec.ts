import { assertEx } from '@xylabs/assert'
import { XyoArchivistApi } from '@xyo-network/api'
import { XyoApiConfig } from '@xyo-network/api-models'
import { Module } from '@xyo-network/module-model'

import { ModuleWrapper } from './ModuleWrapper'
import { RemoteModuleResolver } from './RemoteModuleResolver'

const apiConfig: XyoApiConfig = { apiDomain: process.env.API_DOMAIN || 'http://localhost:8080' }
const name = 'PayloadDiviner'

describe('RemoteModuleResolver', () => {
  let resolver: RemoteModuleResolver
  beforeAll(() => {
    resolver = new RemoteModuleResolver(apiConfig)
  })
  describe('tryResolve', () => {
    it('resolves by name', async () => {
      const mods = await resolver.resolve({ name: [name] })
      await validateModuleResolutionResponse(mods)
    })
    it('resolves by address', async () => {
      const api = new XyoArchivistApi(apiConfig)
      const response = await api.get()
      expect(response).toBeTruthy()
      expect(response?.address).toBeString()
      const address = assertEx(response?.address)
      const mods = await resolver.resolve({ address: [address] })
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
