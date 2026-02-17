import type { StringKeyObject } from '@xylabs/sdk-js'
import { asSchema, type Payload } from '@xyo-network/payload-model'
import { expect, it } from 'vitest'

const testSchema = asSchema('network.xyo.test', true)
const testPayload: Payload<StringKeyObject> = {
  _hash: '20e14207f952a09f767ff614a648546c037fe524ace0bfe55db31f818aff1f1c',
  _timestamp: 1_609_459_255_555,
  numberField: 1,
  objectField: {
    numberField: 1,
    stringField: 'stringValue',
  },
  schema: testSchema,
  stringField: 'stringValue',
}

it('no test', () => {
  expect(true).toBeTruthy()
})

export { testPayload, testSchema }
