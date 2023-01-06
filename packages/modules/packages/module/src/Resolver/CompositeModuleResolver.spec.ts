import { Module, ModuleRepository } from '@xyo-network/module-model'
import { mock, MockProxy } from 'jest-mock-extended'

import { CompositeModuleResolver } from './CompositeModuleResolver'
import { SimpleModuleResolver } from './SimpleModuleResolver'

const moduleAName = 'moduleA'
const moduleBName = 'moduleB'
const moduleCName = 'moduleC'

describe('CompositeModuleResolver', () => {
  describe('with multiple resolvers', () => {
    let moduleA: MockProxy<Module>
    let moduleB: MockProxy<Module>
    let moduleC: MockProxy<Module>
    let resolverA: SimpleModuleResolver
    let resolverB: SimpleModuleResolver
    let resolvers: ModuleRepository[]
    let sut: CompositeModuleResolver
    beforeEach(() => {
      moduleA = mock<Module>({
        address: 'A',
      })
      moduleB = mock<Module>({
        address: 'B',
      })
      moduleC = mock<Module>({
        address: 'C',
      })
      resolverA = new SimpleModuleResolver()
      resolverA.add(moduleA, moduleAName)
      resolverA.add(moduleC, moduleCName)
      resolverB = new SimpleModuleResolver()
      resolverB.add(moduleB, moduleBName)
      resolverB.add(moduleC, moduleCName)
      resolvers = [resolverA, resolverB]
      sut = new CompositeModuleResolver(resolvers)
    })
    it('resolves module in first resolver', async () => {
      const result = await sut.tryResolve({ name: [moduleAName] })
      expect(result).toBeArrayOfSize(1)
    })
    it('resolves module in second resolver', async () => {
      const result = await sut.tryResolve({ name: [moduleBName] })
      expect(result).toBeArrayOfSize(1)
    })
    it('resolves module in both resolvers', async () => {
      const result = await sut.tryResolve({ name: [moduleCName] })
      expect(result).toBeArrayOfSize(1)
    })
  })
})
