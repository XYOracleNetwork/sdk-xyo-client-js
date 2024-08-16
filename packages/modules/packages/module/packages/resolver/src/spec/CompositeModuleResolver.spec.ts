import type { ModuleInstance } from '@xyo-network/module-model'
import { ModuleConfigSchema, ModuleStateQuerySchema } from '@xyo-network/module-model'
import type { MockProxy } from 'jest-mock-extended'
import { mock } from 'jest-mock-extended'

import { CompositeModuleResolver } from '../CompositeModuleResolver'

const moduleAName = 'moduleA'
const moduleBName = 'moduleB'
const moduleCName = 'moduleC'

/**
 * @group module
 */

describe('CompositeModuleResolver', () => {
  describe('with multiple resolvers', () => {
    let moduleA: MockProxy<ModuleInstance>
    let moduleB: MockProxy<ModuleInstance>
    let moduleC: MockProxy<ModuleInstance>
    let resolverA: CompositeModuleResolver
    let resolverB: CompositeModuleResolver

    let sut: CompositeModuleResolver
    beforeEach(() => {
      moduleA = mock<ModuleInstance>({
        address: 'b0e75b722e6cb03bbae3f488ed1e5a82bd7c381a',
        config: { name: moduleAName, schema: ModuleConfigSchema },
        modName: moduleAName,
        queries: [ModuleStateQuerySchema],
        query: jest.fn(),
      })
      moduleB = mock<ModuleInstance>({
        address: 'b0e75b722e6cb03bbae3f488ed1e5a82bd7c381b',
        config: { name: moduleBName, schema: ModuleConfigSchema },
        modName: moduleBName,
        queries: [ModuleStateQuerySchema],
        query: jest.fn(),
      })
      moduleC = mock<ModuleInstance>({
        address: 'b0e75b722e6cb03bbae3f488ed1e5a82bd7c381c',
        config: { name: moduleCName, schema: ModuleConfigSchema },
        modName: moduleCName,
        queries: [ModuleStateQuerySchema],
        query: jest.fn(),
      })
      resolverA = new CompositeModuleResolver({ root: moduleB })
      resolverA.add(moduleA)
      resolverA.add(moduleC)
      resolverB = new CompositeModuleResolver({ root: moduleA })
      resolverB.add(moduleB)
      resolverB.add(moduleC)

      sut = new CompositeModuleResolver({ root: moduleC }).addResolver(resolverA).addResolver(resolverB)
    })
    describe('add', () => {
      it('adds module to resolvers', async () => {
        const address = 'b0e75b722e6cb03bbae3f488ed1e5a82bd7c381d'
        const name = 'mod'
        const mod = mock<ModuleInstance>({
          address,
          config: { name, schema: ModuleConfigSchema },
          modName: name,
          queries: [ModuleStateQuerySchema],
          query: jest.fn(),
        })
        expect(sut.add(mod)).toEqual(sut)
        expect(await sut.resolve({ address: [address] })).toBeArrayOfSize(1)
        expect(await sut.resolve({ name: [name] })).toBeArrayOfSize(1)
        expect(await resolverA.resolve({ address: [address] })).toBeArrayOfSize(0)
        expect(await resolverA.resolve({ address: [] })).toBeArrayOfSize(0)
        expect(await resolverA.resolve({ name: [name] })).toBeArrayOfSize(0)
        expect(await resolverB.resolve({ address: [address] })).toBeArrayOfSize(0)
        expect(await resolverB.resolve({ name: [name] })).toBeArrayOfSize(0)
      })
    })
    describe('remove', () => {
      it('removes module from resolvers', async () => {
        const address = moduleC.address
        const name = moduleCName

        expect(resolverA.remove(address)).toEqual(resolverA)
        expect(await sut.resolve({ address: [address] })).toBeArrayOfSize(1)
        expect(await sut.resolve({ name: [name] })).toBeArrayOfSize(1)
        expect(await resolverA.resolve({ address: [address] })).toBeArrayOfSize(0)
        expect(await resolverA.resolve({ name: [name] })).toBeArrayOfSize(0)
        expect(await resolverB.resolve({ address: [address] })).toBeArrayOfSize(1)
        expect(await resolverB.resolve({ name: [name] })).toBeArrayOfSize(1)

        expect(resolverB.remove(address)).toEqual(resolverB)
        expect(await sut.resolve({ address: [address] })).toBeArrayOfSize(0)
        expect(await sut.resolve({ name: [name] })).toBeArrayOfSize(0)
        expect(await resolverA.resolve({ address: [address] })).toBeArrayOfSize(0)
        expect(await resolverA.resolve({ name: [name] })).toBeArrayOfSize(0)
        expect(await resolverB.resolve({ address: [address] })).toBeArrayOfSize(0)
        expect(await resolverB.resolve({ name: [name] })).toBeArrayOfSize(0)
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
  })
})
