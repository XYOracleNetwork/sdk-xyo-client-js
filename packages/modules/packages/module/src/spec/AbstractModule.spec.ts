import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { ModuleConfigSchema, ModuleParams } from '@xyo-network/module-model'
import { QuerySchema } from '@xyo-network/query-payload-plugin'

import { AbstractModule } from '../AbstractModule'
export class TestAbstractModule extends AbstractModule {
  static override configSchema = ModuleConfigSchema
  static override async create<TParams extends ModuleParams>(params?: TParams) {
    return await super.create<TParams>(params)
  }
}

describe('AbstractModule', () => {
  let sut: TestAbstractModule
  beforeAll(async () => {
    sut = (await TestAbstractModule.create()) as TestAbstractModule
  })
  it('should instantiate', () => {
    expect(sut).toBeTruthy()
  })

  it('should validate config', () => {
    class TestClass {}
    const invalidConfig = {
      config: {
        options: {
          foo: new TestClass(),
        },
      },
    }
    const validConfig = {
      config: {
        options: {
          foo: 'foo',
        },
      },
    }
    expect(sut['validateConfig'](invalidConfig)).toBeFalse()
    expect(sut['validateConfig'](validConfig)).toBeTrue()
  })
  describe('discover', () => {
    it('returns address', async () => {
      const response = await sut.discover()
      expect(response.some((p) => p.schema === AddressSchema && (p as AddressPayload).address === sut.address)).toBeTrue()
    })
    it('returns config', async () => {
      const response = await sut.discover()
      expect(response.some((p) => p.schema === ModuleConfigSchema)).toBeTrue()
    })
    it('returns supported queries', async () => {
      const response = await sut.discover()
      expect(response.some((p) => p.schema === QuerySchema)).toBeTrue()
    })
  })
})
