import { dumpErrors } from '../../dumpErrors'
import { XyoPayload } from '../../models'
import { XyoPayloadValidator } from './Validator'

const testPayloadNoSchema: XyoPayload = {
  _hash: '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a',
  _timestamp: 1609459255555,
} as XyoPayload
const testPayloadMixedCase: XyoPayload = {
  _hash: '9a67116e05c33135f6ba23768f9a3fbbba155297ee1bb0a7e21d91fdc3835769',
  _timestamp: 1609459255555,
  schema: 'network.xyo.testMixedCaseSchema',
}
const testPayloadTooFewLevels: XyoPayload = {
  _hash: '95206b26e3173deaac5e3f5d4510d50112b6348d3a2128b1eb6fe3ca66957628',
  _timestamp: 1609459255555,
  schema: 'network.xyo',
}
const testPayloadDoesNotExist: XyoPayload = {
  _hash: '360b4ce36862ef2a20dd572d69283a86d351b2b4a9cd4f61ae6f7a320be81dbf',
  _timestamp: 1609459255555,
  schema: 'network.dfd-sf-sf-s.blahblah',
}
const testPayloadValid: XyoPayload = {
  _hash: '4b5958c6d16b26d6790e33f5be45578728b0ea36e40a0d1b9c9164822341cac1',
  _timestamp: 1609459255555,
  schema: 'network.xyo.test',
}

test('all [missing schema]', () => {
  const validator = new XyoPayloadValidator(testPayloadNoSchema)
  const errors = validator.all()
  expect(errors.length).toBe(1)
})

test('all [mixed case]', () => {
  const validator = new XyoPayloadValidator(testPayloadMixedCase)
  const errors = validator.all()
  expect(errors.length).toBe(1)
})

test('all [too few levels]', () => {
  const validator = new XyoPayloadValidator(testPayloadTooFewLevels)
  const errors = validator.all()
  expect(errors.length).toBe(1)
})

test('all [does not exist]', () => {
  const validator = new XyoPayloadValidator(testPayloadDoesNotExist)
  const errors = validator.all()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})

test('all [valid]', () => {
  const validator = new XyoPayloadValidator(testPayloadValid)

  let errors: Error[] = []
  errors = validator.all()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})
