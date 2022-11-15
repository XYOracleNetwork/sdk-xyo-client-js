import { StringKeyObject } from '@xyo-network/core'

import { XyoPayload } from '../models'

const testSchema = 'network.xyo.test'
const testPayload: XyoPayload<StringKeyObject> = {
  numberField: 1,
  objectField: {
    numberField: 1,
    stringField: 'stringValue',
  },
  schema: testSchema,
  stringField: 'stringValue',
}

export { testPayload, testSchema }
