import { ModuleConfigSchema, ModuleInstance } from '@xyo-network/module-model'
import { mock, MockProxy } from 'jest-mock-extended'

import { SimpleModuleResolver } from '../SimpleModuleResolver'

const moduleAName = 'moduleA'
const moduleBName = 'moduleB'

describe('SimpleModuleResolver', () => {
  describe('with multiple resolvers', () => {
    let moduleA: MockProxy<ModuleInstance>
    let moduleB: MockProxy<ModuleInstance>
    let sut: SimpleModuleResolver
    beforeEach(() => {
      moduleA = mock<ModuleInstance>({
        address: 'b0e75b722e6cb03bbae3f488ed1e5a82bd7c381a',
        config: { name: moduleAName, schema: ModuleConfigSchema },
      })
      moduleB = mock<ModuleInstance>({
        address: 'b0e75b722e6cb03bbae3f488ed1e5a82bd7c381b',
        config: { name: moduleBName, schema: ModuleConfigSchema },
      })
      sut = new SimpleModuleResolver()
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
      it('resolves module]', async () => {
        const result = await sut.resolve({ name: [moduleAName] })
        expect(result).toBeArrayOfSize(1)
      })
    })
  })
})
