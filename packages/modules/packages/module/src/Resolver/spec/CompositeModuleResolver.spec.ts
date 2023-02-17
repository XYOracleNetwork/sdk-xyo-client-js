import { Module } from '@xyo-network/module-model'
import { mock, MockProxy } from 'jest-mock-extended'

import { AbstractModule } from '../../AbstractModule'
import { CompositeModuleResolver } from '../CompositeModuleResolver'

const moduleAName = 'moduleA'
const moduleBName = 'moduleB'
const moduleCName = 'moduleC'

describe('CompositeModuleResolver', () => {
  describe('with multiple resolvers', () => {
    let moduleA: MockProxy<AbstractModule>
    let moduleB: MockProxy<AbstractModule>
    let moduleC: MockProxy<AbstractModule>
    let resolverA: CompositeModuleResolver
    let resolverB: CompositeModuleResolver

    let sut: CompositeModuleResolver
    beforeEach(() => {
      moduleA = mock<AbstractModule>({ address: 'b0e75b722e6cb03bbae3f488ed1e5a82bd7c381a' })
      moduleB = mock<AbstractModule>({ address: 'b0e75b722e6cb03bbae3f488ed1e5a82bd7c381b' })
      moduleC = mock<AbstractModule>({ address: 'b0e75b722e6cb03bbae3f488ed1e5a82bd7c381c' })
      resolverA = new CompositeModuleResolver()
      resolverA.add(moduleA, moduleAName)
      resolverA.add(moduleC, moduleCName)
      resolverB = new CompositeModuleResolver()
      resolverB.add(moduleB, moduleBName)
      resolverB.add(moduleC, moduleCName)

      sut = new CompositeModuleResolver().addResolver(resolverA).addResolver(resolverB)
    })
    describe('add', () => {
      it('adds module to resolvers', async () => {
        const address = 'b0e75b722e6cb03bbae3f488ed1e5a82bd7c381d'
        const name = 'mod'
        const mod = mock<AbstractModule>({ address })
        expect(sut.add(mod, name)).toEqual(sut)
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
        expect(sut.remove(address)).toEqual(sut)
        expect(await sut.resolve({ address: [address] })).toBeArrayOfSize(1)
        expect(await sut.resolve({ name: [name] })).toBeArrayOfSize(1)
        expect(await resolverA.resolve({ address: [address] })).toBeArrayOfSize(1)
        expect(await resolverA.resolve({ name: [name] })).toBeArrayOfSize(1)
        expect(await resolverB.resolve({ address: [address] })).toBeArrayOfSize(1)
        expect(await resolverB.resolve({ name: [name] })).toBeArrayOfSize(1)
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
