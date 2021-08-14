import dumpErrors from '../../dumpErrors'
import { XyoPayload } from '../../models'
import Validator from './Validator'

const testPayloadNoSchmea: XyoPayload = {}
const testPayloadMixedCase: XyoPayload = {
  schema: 'network.xyo.testMixedCaseSchema',
}
const testPayloadTooFewLevels: XyoPayload = {
  schema: 'network.xyo',
}
const testPayloadDoesNotExist: XyoPayload = {
  schema: 'network.dfd-sf-sf-s.blahblah',
}
const testPayloadValid: XyoPayload = {
  schema: 'network.xyo.test',
}

test('all [missing schema]', () => {
  const validator = new Validator(testPayloadNoSchmea)
  const errors = validator.all()
  dumpErrors(errors)
  expect(errors.length).toBe(1)
})

test('all [mixed case]', () => {
  const validator = new Validator(testPayloadMixedCase)
  const errors = validator.all()
  dumpErrors(errors)
  expect(errors.length).toBe(1)
})

test('all [too few levels]', () => {
  const validator = new Validator(testPayloadTooFewLevels)
  const errors = validator.all()
  dumpErrors(errors)
  expect(errors.length).toBe(1)
})

test('all [does not exist]', () => {
  const validator = new Validator(testPayloadDoesNotExist)
  const errors = validator.all()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})

test('all [valid]', () => {
  const validator = new Validator(testPayloadValid)

  let errors: Error[] = []
  errors = validator.all()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})

test('allDynamic [does not exist]', async () => {
  const validator = new Validator(testPayloadDoesNotExist)
  const errors = await validator.allDynamic()
  dumpErrors(errors)
  expect(errors.length).toBe(1)
})

test('allDynamic [valid]', async () => {
  const validator = new Validator(testPayloadValid)
  const errors = await validator.allDynamic()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})
