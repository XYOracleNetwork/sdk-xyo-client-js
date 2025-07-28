import { ModuleManifestPayloadSchema } from '@xyo-network/manifest-model'
import { ModuleConfigSchema } from '@xyo-network/module-model'
import type { Schema } from '@xyo-network/payload-model'
import {
  beforeAll, describe, expect, it,
} from 'vitest'

import { AbstractModuleInstance } from '../AbstractModuleInstance.ts'
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
    class TestClass {
      foo = () => 10
    }
    const invalidConfig = { config: { options: { foo: new TestClass() } } }
    const validConfig = { config: { options: { foo: 'foo' } } }
    expect(sut['validateConfig'](invalidConfig)).toBe(false)
    expect(sut['validateConfig'](validConfig)).toBe(true)
  })
  describe('manifest', () => {
    it('returns manifest', async () => {
      const response = await sut.manifest()
      // console.log(`manifest: ${toSafeJsonString(response, 5)}`)
      expect(response.schema).toBe(ModuleManifestPayloadSchema)
    })
  })
  describe('state', () => {
    it('returns state', async () => {
      const response = await sut.state()
      // console.log(`state: ${toSafeJsonString(response, 5)}`)
      expect(response.some(p => p.schema === ModuleManifestPayloadSchema)).toBe(true)
    })
  })
})
