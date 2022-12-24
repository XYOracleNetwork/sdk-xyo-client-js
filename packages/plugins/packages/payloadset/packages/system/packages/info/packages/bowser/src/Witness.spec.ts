/**
 * @jest-environment jsdom
 */

import { XyoBowserSystemInfoSchema } from '@xyo-network/bowser-system-info-payload-plugin'
import { PayloadValidator } from '@xyo-network/payload-validator'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { XyoSchemaNameValidator } from '@xyo-network/schema-name-validator'
import crypto from 'crypto'

import { XyoBowserSystemInfoWitnessConfigSchema } from './Config'
import { XyoBowserSystemInfoWitness } from './Witness'

PayloadValidator.setSchemaNameValidatorFactory((schema) => new XyoSchemaNameValidator(schema))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cryptoPolyfill = (window: Window & typeof globalThis) => {
  window.crypto = window.crypto ?? {
    getRandomValues: (arr: []) => crypto.randomBytes(arr.length),
  }
}

cryptoPolyfill(window)

describe('XyoBowserSystemInfo', () => {
  test('observe', async () => {
    const witness = await XyoBowserSystemInfoWitness.create({
      config: {
        schema: XyoBowserSystemInfoWitnessConfigSchema,
      },
    })
    const [observation] = await witness.observe()
    expect(observation.schema).toBe(XyoBowserSystemInfoSchema)
    expect(new PayloadWrapper(observation).valid).toBe(true)
  })
  test('observe [no config]', async () => {
    const witness = await XyoBowserSystemInfoWitness.create()
    const [observation] = await witness.observe()
    expect(observation.schema).toBe(XyoBowserSystemInfoSchema)
    expect(new PayloadWrapper(observation).valid).toBe(true)
  })
})
