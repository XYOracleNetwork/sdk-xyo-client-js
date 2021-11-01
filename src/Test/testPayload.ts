import { XyoPayload } from '../models'

const testPayload: XyoPayload = {
  _archive: 'test',
  _hash: 'b867e9340c3f5d8c8b29854bd06d6b6b59c984a452451f159c7ef42c3349be47',
  numberField: 1,
  objectField: {
    numberField: 1,
    stringField: 'stringValue',
  },
  schema: 'network.xyo.test',
  stringField: 'stringValue',
}

export default testPayload
