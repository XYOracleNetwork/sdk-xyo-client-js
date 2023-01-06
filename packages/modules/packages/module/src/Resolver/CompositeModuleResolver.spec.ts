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
      moduleA = mock<Module>({ address: 'b0e75b722e6cb03bbae3f488ed1e5a82bd7c381a' })
      moduleB = mock<Module>({ address: 'b0e75b722e6cb03bbae3f488ed1e5a82bd7c381b' })
      moduleC = mock<Module>({ address: 'b0e75b722e6cb03bbae3f488ed1e5a82bd7c381c' })
      resolverA = new SimpleModuleResolver()
      resolverA.add(moduleA, moduleAName)
      resolverA.add(moduleC, moduleCName)
      resolverB = new SimpleModuleResolver()
      resolverB.add(moduleB, moduleBName)
      resolverB.add(moduleC, moduleCName)
      resolvers = [resolverA, resolverB]
      sut = new CompositeModuleResolver(resolvers)
    })
    describe('add', () => {
      it('adds module to resolvers', async () => {
        const address = 'b0e75b722e6cb03bbae3f488ed1e5a82bd7c381d'
        const name = 'mod'
        const mod = mock<Module>({ address })
        expect(sut.add(mod, name)).toBeTruthy()
        expect(await sut.tryResolve({ address: [address] })).toBeArrayOfSize(1)
        expect(await sut.tryResolve({ name: [name] })).toBeArrayOfSize(1)
        expect(await resolverA.tryResolve({ address: [address] })).toBeArrayOfSize(1)
        expect(await resolverA.tryResolve({ name: [name] })).toBeArrayOfSize(1)
        expect(await resolverB.tryResolve({ address: [address] })).toBeArrayOfSize(1)
        expect(await resolverB.tryResolve({ name: [name] })).toBeArrayOfSize(1)
      })
    })
    describe.skip('remove', () => {
      it('removes module from resolvers', async () => {
        const address = moduleC.address
        const name = moduleCName
        expect(await sut.tryResolve({ address: [address] })).toBeArrayOfSize(0)
        expect(await sut.tryResolve({ name: [name] })).toBeArrayOfSize(0)
        expect(await resolverA.tryResolve({ address: [address] })).toBeArrayOfSize(0)
        expect(await resolverA.tryResolve({ name: [name] })).toBeArrayOfSize(0)
        expect(await resolverB.tryResolve({ address: [address] })).toBeArrayOfSize(0)
        expect(await resolverB.tryResolve({ name: [name] })).toBeArrayOfSize(0)
      })
    })
    describe('resolve', () => {
      it('resolves module in first resolver', async () => {
        const result = await sut.resolve({ name: [moduleAName] })
        expect(result).toBeArrayOfSize(1)
      })
      it('resolves module in second resolver', async () => {
        const result = await sut.resolve({ name: [moduleBName] })
        expect(result).toBeArrayOfSize(1)
      })
      it('resolves module in both resolvers', async () => {
        const result = await sut.resolve({ name: [moduleCName] })
        expect(result).toBeArrayOfSize(1)
      })
    })
    describe('tryResolve', () => {
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
})
