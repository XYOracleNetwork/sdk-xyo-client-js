import { ModuleManifestPayloadSchema } from '@xyo-network/manifest-model'
import { ModuleConfigSchema, ModuleDetailsError } from '@xyo-network/module-model'
import type { Schema } from '@xyo-network/payload-model'
import {
  beforeAll, describe, expect, it,
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
  test('build', async () => {
    const error = new ModuleDetailsError('errorMessage', { details: 'yo' })
    const errorPayload = await new ModuleErrorBuilder()
      .sources(['0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'])
      .name('<Unknown>')
      .query('network.xyo.query.insert')
      .details(error.details)
      .message(error.message)
      .build()
    expect(errorPayload.message).toBe('errorMessage')
  })
})
