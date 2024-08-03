import { ModuleManifestPayloadSchema } from '@xyo-network/manifest-model'
import { ModuleConfigSchema } from '@xyo-network/module-model'
import { Schema } from '@xyo-network/payload-model'

import { AbstractModuleInstance } from '../AbstractModuleInstance'
export class TestAbstractModule extends AbstractModuleInstance {
  static override readonly configSchemas: Schema[] = [ModuleConfigSchema]
}

/**
 * @group module
 */

describe('AbstractModule', () => {
  let sut: TestAbstractModule
  beforeAll(async () => {
    sut = await TestAbstractModule.create({ account: 'random' })
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
  describe('manifest', () => {
    it('returns manifest', async () => {
      const response = await sut.manifest()
      // console.log(`manifest: ${toJsonString(response, 5)}`)
      expect(response.schema).toBe(ModuleManifestPayloadSchema)
    })
  })
  describe('state', () => {
    it('returns state', async () => {
      const response = await sut.state()
      // console.log(`state: ${toJsonString(response, 5)}`)
      expect(response.some(p => p.schema === ModuleManifestPayloadSchema)).toBeTrue()
    })
  })
})
