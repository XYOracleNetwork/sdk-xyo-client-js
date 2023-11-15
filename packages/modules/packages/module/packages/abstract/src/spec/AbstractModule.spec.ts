import { Account } from '@xyo-network/account'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { ModuleConfigSchema } from '@xyo-network/module-model'
import { QuerySchema } from '@xyo-network/query-payload-plugin'

import { AbstractModuleInstance } from '../AbstractModuleInstance'
export class TestAbstractModule extends AbstractModuleInstance {
  static override readonly configSchemas: string[] = [ModuleConfigSchema]
  protected override get _queryAccountPaths() {
    return super._baseModuleQueryAccountPaths
  }
}

/**
 * @group module
 */

describe('AbstractModule', () => {
  let sut: TestAbstractModule
  beforeAll(async () => {
    sut = await TestAbstractModule.create({ account: Account.randomSync() })
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
