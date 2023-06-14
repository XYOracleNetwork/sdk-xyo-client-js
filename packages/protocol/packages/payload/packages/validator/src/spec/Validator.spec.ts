import { dumpErrors } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'
import { SchemaNameValidator } from '@xyo-network/schema-name-validator'

import { PayloadValidator } from '../Validator'

PayloadValidator.setSchemaNameValidatorFactory((schema) => new SchemaNameValidator(schema))

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

test('all [missing schema]', async () => {
  const validator = new PayloadValidator(testPayloadNoSchema)
  const errors = await validator.validate()
  expect(errors.length).toBe(1)
})

test('all [mixed case]', async () => {
  const validator = new PayloadValidator(testPayloadMixedCase)
  const errors = await validator.validate()
  expect(errors.length).toBe(1)
})

test('all [too few levels]', async () => {
  const validator = new PayloadValidator(testPayloadTooFewLevels)
  const errors = await validator.validate()
  expect(errors.length).toBe(1)
})

test('all [does not exist]', async () => {
  const validator = new PayloadValidator(testPayloadDoesNotExist)
  const errors = await validator.validate()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})

test('all [valid]', async () => {
  const validator = new PayloadValidator(testPayloadValid)

  let errors: Error[] = []
  errors = await validator.validate()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})
