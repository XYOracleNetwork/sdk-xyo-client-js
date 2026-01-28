import { ModuleConfigSchema, ModuleDetailsError } from '@xyo-network/module-model'
import { asSchema, type Schema } from '@xyo-network/payload-model'
import {
  describe, expect,
  test,
} from 'vitest'

import { AbstractModuleInstance } from '../AbstractModuleInstance.ts'
import { ModuleErrorBuilder } from '../Error.ts'
export class TestAbstractModule extends AbstractModuleInstance {
  static override readonly configSchemas: Schema[] = [ModuleConfigSchema]
}

/**
 * @group module
 */

describe('ModuleErrorBuilder', () => {
  test('build', () => {
    const error = new ModuleDetailsError('errorMessage', { details: 'yo' })
    const errorPayload = new ModuleErrorBuilder()
      .meta({ $sources: ['0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'] })
      .name('<Unknown>')
      .query(asSchema('network.xyo.query.insert', true))
      .details(error.details)
      .message(error.message)
      .build()
    expect(errorPayload.message).toBe('errorMessage')
  })
})
