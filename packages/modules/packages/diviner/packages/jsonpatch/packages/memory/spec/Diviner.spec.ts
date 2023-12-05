import { Account } from '@xyo-network/account'
import { JsonPatch, JsonPatchDivinerConfigSchema } from '@xyo-network/diviner-jsonpatch-model'
import { Payload } from '@xyo-network/payload-model'
import { isValuePayload, Value, ValueSchema } from '@xyo-network/value-payload-plugin'

import { MemoryJsonPatchDiviner } from '../src'

const cases: [jsonpatch: JsonPatch, payload: Payload, expected: Value][] = [
  [
    {
      jsonpatch: {
        host: '$.MONGO_HOST',
        password: '$.MONGO_PASSWORD',
        port: '$.MONGO_PORT',
        username: '$.MONGO_USERNAME',
      },
      schema: 'network.xyo.diviner.jsonpatch',
    },
    {
      MONGO_HOST: 'http://localhost',
      MONGO_PASSWORD: 'password',
      MONGO_PORT: '54321',
      MONGO_USERNAME: 'username',
      schema: 'foo.bar.baz',
    } as Payload,
    {
      schema: ValueSchema,
      value: {
        host: 'http://localhost',
        password: 'password',
        port: '54321',
        username: 'username',
      },
    },
  ],
]

/**
 * @group module
 * @group diviner
 */

describe('MemoryJsonPatchDiviner', () => {
  let sut: MemoryJsonPatchDiviner
  let account: Account
  beforeAll(() => {
    account = Account.randomSync()
  })
  describe('divine', () => {
    it.each(cases)('should jsonpatch the input according to the jsonpatch', async (jsonpatch, payload, expected) => {
      const config = { jsonpatch: jsonpatch.jsonpatch, schema: JsonPatchDivinerConfigSchema }
      sut = await MemoryJsonPatchDiviner.create({ account, config })
      const result = await sut.divine([payload])
      expect(result).toBeArrayOfSize(1)
      const actual = result.filter(isValuePayload)[0]
      expect(actual).toBeDefined()
      expect(actual.value).toBeObject()
      expect(actual).toEqual(expected)
    })
  })
})
