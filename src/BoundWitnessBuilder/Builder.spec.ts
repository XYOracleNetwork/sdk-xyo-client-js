import { XyoPayloadMeta } from '../models'
import Builder from './Builder'

interface TestPayload extends XyoPayloadMeta {
  numberField: number
  objectField: {
    numberValue: number
    stringValue: string
  }
  stringField: string
}

test('checking happy path', () => {
  let builder = new Builder<TestPayload>()
  expect(builder).toBeDefined()
  builder = builder.witness('1234567890', null)
  expect(builder).toBeDefined()
  const json = builder.build({
    _schema: 'network.xyo.test',
    _timestamp: 1618603439107,
    numberField: 1,
    objectField: {
      numberValue: 2,
      stringValue: 'yo',
    },
    stringField: 'there',
  })
  expect(json).toBeDefined()
  expect(json._hash).toEqual('7b074e35751801ca5b4d813bf52cc7ffa44912264ec5f40365dd8a5306d56094')
})
