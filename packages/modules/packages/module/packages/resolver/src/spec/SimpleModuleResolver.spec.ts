import type { ModuleInstance } from '@xyo-network/module-model'
import { ModuleConfigSchema, ModuleStateQuerySchema } from '@xyo-network/module-model'
import type { MockedObject } from 'vitest'
import {
  beforeEach, describe, it, vi,
} from 'vitest'

import { SimpleModuleResolver } from '../SimpleModuleResolver.ts'

const moduleAName = 'moduleA'
const moduleBName = 'moduleB'

/**
 * @group module
 */

describe('SimpleModuleResolver', () => {
  describe('with multiple resolvers', () => {
    let moduleA: MockedObject<ModuleInstance>
    let moduleB: MockedObject<ModuleInstance>
    let sut: SimpleModuleResolver
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
        manifest: vi.fn(),
        state: vi.fn(),
        modName: moduleBName,
        queries: [ModuleStateQuerySchema],
        query: vi.fn(),
      }, true) as MockedObject<ModuleInstance>
      sut = new SimpleModuleResolver({ root: moduleA })
      sut.add(moduleA)
    })
    describe('add', () => {
      it('adds module to resolver', async () => {
        const mod = moduleB
        const address = mod.address
        const name = moduleBName
        expect(sut.add(mod)).toEqual(sut)
        expect(await sut.resolve({ address: [address] })).toBeArrayOfSize(1)
        expect(await sut.resolve({ name: [name] })).toBeArrayOfSize(1)
      })
    })
    describe('remove', () => {
      it('removes module from resolver', async () => {
        const address = moduleA.address
        const name = moduleAName
        expect(sut.remove(address)).toEqual(sut)
        expect(await sut.resolve({ address: [moduleA.address] })).toBeArrayOfSize(0)
        expect(await sut.resolve({ name: [name] })).toBeArrayOfSize(0)
      })
    })
    describe('resolve', () => {
      it('resolves module', async () => {
        const result = await sut.resolve({ name: [moduleAName] })
        expect(result).toBeArrayOfSize(1)
      })
    })
    describe('tryResolve', () => {
      it('resolves module', async () => {
        const result = await sut.resolve({ name: [moduleAName] })
        expect(result).toBeArrayOfSize(1)
      })
    })
  })
})
