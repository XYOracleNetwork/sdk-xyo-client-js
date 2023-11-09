/**
 * @jest-environment jsdom
 */
import { Account } from '@xyo-network/account'
import { BowserSystemInfoSchema } from '@xyo-network/bowser-system-info-payload-plugin'
import { PayloadValidator } from '@xyo-network/payload-validator'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { SchemaNameValidator } from '@xyo-network/schema-name-validator'
import Crypto from 'crypto'

import { BowserSystemInfoWitnessConfigSchema } from '../Config'
import { BowserSystemInfoWitness } from '../Witness'

PayloadValidator.setSchemaNameValidatorFactory((schema) => new SchemaNameValidator(schema))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cryptoPolyfill = (window: Window & typeof globalThis) => {
  window.crypto = window.crypto ?? {
    getRandomValues: (arr: []) => Crypto.randomBytes(arr.length),
  }
}

cryptoPolyfill(window)

describe('BowserSystemInfo', () => {
  test('observe', async () => {
    const witness = await BowserSystemInfoWitness.create({
      account: Account.randomSync(),
      config: {
        schema: BowserSystemInfoWitnessConfigSchema,
      },
    })
    const [observation] = await witness.observe()
    expect(observation.schema).toBe(BowserSystemInfoSchema)
    expect(await PayloadWrapper.wrap(observation).getValid()).toBe(true)
  })
  test('observe [no config]', async () => {
    const witness = await BowserSystemInfoWitness.create({ account: Account.randomSync() })
    const [observation] = await witness.observe()
    expect(observation.schema).toBe(BowserSystemInfoSchema)
    expect(await PayloadWrapper.wrap(observation).getValid()).toBe(true)
  })
})
