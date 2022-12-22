import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { AbstractModuleConfigSchema } from '@xyo-network/module-model'
import { QuerySchema } from '@xyo-network/query-payload-plugin'

import { AbstractModule } from './AbstractModule'
export class TestAbstractModule extends AbstractModule {
  static configSchema = AbstractModuleConfigSchema
  static override async create(params?: object) {
    return await super.create(params)
  }
}

describe('AbstractModule', () => {
  let sut: TestAbstractModule
  beforeAll(async () => {
    sut = await TestAbstractModule.create()
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
      expect(response.some((p) => p.schema === AddressSchema)).toBeTrue()
    })
    it('returns config', async () => {
      const response = await sut.discover()
      expect(response.some((p) => p.schema === AbstractModuleConfigSchema)).toBeTrue()
    })
    it('returns supported queries', async () => {
      const response = await sut.discover()
      expect(response.some((p) => p.schema === QuerySchema)).toBeTrue()
    })
  })
})
