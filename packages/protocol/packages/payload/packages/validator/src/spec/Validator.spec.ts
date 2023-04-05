import { dumpErrors } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'
import { XyoSchemaNameValidator } from '@xyo-network/schema-name-validator'

import { PayloadValidator } from '../Validator'

PayloadValidator.setSchemaNameValidatorFactory((schema) => new XyoSchemaNameValidator(schema))

const testPayloadNoSchema: Payload = {} as Payload
const testPayloadMixedCase: Payload = {
  schema: 'network.xyo.testMixedCaseSchema',
} as Payload
const testPayloadTooFewLevels: Payload = {
  schema: 'network.xyo',
} as Payload
const testPayloadDoesNotExist: Payload = {
  schema: 'network.dfd-sf-sf-s.blahblah',
} as Payload
const testPayloadValid: Payload = {
  schema: 'network.xyo.test',
} as Payload

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
