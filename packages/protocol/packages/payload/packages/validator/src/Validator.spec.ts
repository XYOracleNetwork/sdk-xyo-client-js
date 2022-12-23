import { dumpErrors } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload-model'

import { PayloadValidator } from './Validator'

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
  const validator = new PayloadValidator(testPayloadNoSchema)
  const errors = validator.validate()
  expect(errors.length).toBe(1)
})

test('all [mixed case]', () => {
  const validator = new PayloadValidator(testPayloadMixedCase)
  const errors = validator.validate()
  expect(errors.length).toBe(1)
})

test('all [too few levels]', () => {
  const validator = new PayloadValidator(testPayloadTooFewLevels)
  const errors = validator.validate()
  expect(errors.length).toBe(1)
})

test('all [does not exist]', () => {
  const validator = new PayloadValidator(testPayloadDoesNotExist)
  const errors = validator.validate()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})

test('all [valid]', () => {
  const validator = new PayloadValidator(testPayloadValid)

  let errors: Error[] = []
  errors = validator.validate()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})
