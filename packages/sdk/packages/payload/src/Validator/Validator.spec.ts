import { dumpErrors } from '@xyo-network/core'

import { XyoPayload } from '../models'
import { XyoPayloadValidator } from './Validator'

const testPayloadNoSchema: XyoPayload = {} as XyoPayload
const testPayloadMixedCase: XyoPayload = {
  schema: 'network.xyo.testMixedCaseSchema',
} as XyoPayload
const testPayloadTooFewLevels: XyoPayload = {
  schema: 'network.xyo',
} as XyoPayload
const testPayloadDoesNotExist: XyoPayload = {
  schema: 'network.dfd-sf-sf-s.blahblah',
} as XyoPayload
const testPayloadValid: XyoPayload = {
  schema: 'network.xyo.test',
} as XyoPayload

test('all [missing schema]', () => {
  const validator = new XyoPayloadValidator(testPayloadNoSchema)
  const errors = validator.validate()
  expect(errors.length).toBe(1)
})

test('all [mixed case]', () => {
  const validator = new XyoPayloadValidator(testPayloadMixedCase)
  const errors = validator.validate()
  expect(errors.length).toBe(1)
})

test('all [too few levels]', () => {
  const validator = new XyoPayloadValidator(testPayloadTooFewLevels)
  const errors = validator.validate()
  expect(errors.length).toBe(1)
})

test('all [does not exist]', () => {
  const validator = new XyoPayloadValidator(testPayloadDoesNotExist)
  const errors = validator.validate()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})

test('all [valid]', () => {
  const validator = new XyoPayloadValidator(testPayloadValid)

  let errors: Error[] = []
  errors = validator.validate()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})
