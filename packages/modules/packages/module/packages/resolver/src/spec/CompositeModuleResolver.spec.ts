import type { ModuleInstance } from '@xyo-network/module-model'
import { ModuleConfigSchema, ModuleStateQuerySchema } from '@xyo-network/module-model'
import type { MockedObject } from 'vitest'
import {
  beforeEach, describe, it, vi,
} from 'vitest'

import { CompositeModuleResolver } from '../CompositeModuleResolver.ts'

const moduleAName = 'moduleA'
const moduleBName = 'moduleB'
const moduleCName = 'moduleC'

/**
 * @group module
 */

describe('CompositeModuleResolver', () => {
  describe('with multiple resolvers', () => {
    let moduleA: MockedObject<ModuleInstance>
    let moduleB: MockedObject<ModuleInstance>
    let moduleC: MockedObject<ModuleInstance>
    let resolverA: CompositeModuleResolver
    let resolverB: CompositeModuleResolver

    let sut: CompositeModuleResolver
    beforeEach(() => {
      moduleA = vi.mocked<Partial<ModuleInstance>>({
        address: 'b0e75b722e6cb03bbae3f488ed1e5a82bd7c381a',
        config: { name: moduleAName, schema: ModuleConfigSchema },
        modName: moduleAName,
        manifest: vi.fn(),
        state: vi.fn(),
        queries: [ModuleStateQuerySchema],
        query: vi.fn(),
      }, true) as MockedObject<ModuleInstance>
      moduleB = vi.mocked<Partial<ModuleInstance>>({
        address: 'b0e75b722e6cb03bbae3f488ed1e5a82bd7c381b',
        config: { name: moduleBName, schema: ModuleConfigSchema },
        modName: moduleBName,
        manifest: vi.fn(),
        state: vi.fn(),
        queries: [ModuleStateQuerySchema],
        query: vi.fn(),
      }, true) as MockedObject<ModuleInstance>
      moduleC = vi.mocked<Partial<ModuleInstance>>({
        address: 'b0e75b722e6cb03bbae3f488ed1e5a82bd7c381c',
        config: { name: moduleCName, schema: ModuleConfigSchema },
        modName: moduleCName,
        manifest: vi.fn(),
        state: vi.fn(),
        queries: [ModuleStateQuerySchema],
        query: vi.fn(),
      }, true) as MockedObject<ModuleInstance>
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
        const mod = vi.mocked<Partial<ModuleInstance>>({
          address,
          config: { name, schema: ModuleConfigSchema },
          manifest: vi.fn(),
          modName: name,
          queries: [ModuleStateQuerySchema],
          query: vi.fn(),
          state: vi.fn(),
        }, true) as MockedObject<ModuleInstance>
        expect(sut.add(mod)).toEqual(sut)
        expect((await sut.resolve({ address: [address] })).length).toBe(1)
        expect((await sut.resolve({ name: [name] })).length).toBe(1)
        expect((await resolverA.resolve({ address: [address] })).length).toBe(0)
        expect((await resolverA.resolve({ address: [] })).length).toBe(0)
        expect((await resolverA.resolve({ name: [name] })).length).toBe(0)
        expect((await resolverB.resolve({ address: [address] })).length).toBe(0)
        expect((await resolverB.resolve({ name: [name] })).length).toBe(0)
      })
    })
    describe('remove', () => {
      it('removes module from resolvers', async () => {
        const address = moduleC.address
        const name = moduleCName

        expect(resolverA.remove(address)).toEqual(resolverA)
        expect((await sut.resolve({ address: [address] })).length).toBe(1)
        expect((await sut.resolve({ name: [name] })).length).toBe(1)
        expect((await resolverA.resolve({ address: [address] })).length).toBe(0)
        expect((await resolverA.resolve({ name: [name] })).length).toBe(0)
        expect((await resolverB.resolve({ address: [address] })).length).toBe(1)
        expect((await resolverB.resolve({ name: [name] })).length).toBe(1)

        expect(resolverB.remove(address)).toEqual(resolverB)
        expect((await sut.resolve({ address: [address] })).length).toBe(0)
        expect((await sut.resolve({ name: [name] })).length).toBe(0)
        expect((await resolverA.resolve({ address: [address] })).length).toBe(0)
        expect((await resolverA.resolve({ name: [name] })).length).toBe(0)
        expect((await resolverB.resolve({ address: [address] })).length).toBe(0)
        expect((await resolverB.resolve({ name: [name] })).length).toBe(0)
      })
    })
    describe('resolve', () => {
      it('resolves module in first resolver', async () => {
        const result = await sut.resolve({ name: [moduleAName] })
        expect(result.length).toBe(1)
      })
      it('resolves module in second resolver', async () => {
        const result = await sut.resolve({ name: [moduleBName] })
        expect(result.length).toBe(1)
      })
      it('resolves module in both resolvers', async () => {
        const result = await sut.resolve({ name: [moduleCName] })
        expect(result.length).toBe(1)
      })
    })
  })
})
