import { HDWallet } from '@xyo-network/account'
import { Transform, TransformDivinerConfigSchema } from '@xyo-network/diviner-transform-model'
import { Payload } from '@xyo-network/payload-model'
import { isValuePayload, Value, ValueSchema } from '@xyo-network/value-payload-plugin'

import { MemoryTransformDiviner } from '../src'

const cases: [transform: Transform, payload: Payload, expected: Value][] = [
  [
    {
      schema: 'network.xyo.diviner.transform',
      transform: {
        host: '$.MONGO_HOST',
        password: '$.MONGO_PASSWORD',
        port: '$.MONGO_PORT',
        username: '$.MONGO_USERNAME',
      },
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

describe('MemoryTransformDiviner', () => {
  let sut: MemoryTransformDiviner
  let wallet: HDWallet
  beforeAll(async () => {
    wallet = await HDWallet.random()
  })
  describe('divine', () => {
    it.each(cases)('should transform the input according to the transform', async (transform, payload, expected) => {
      const config = { schema: TransformDivinerConfigSchema, transform: transform.transform }
      sut = await MemoryTransformDiviner.create({ config, wallet })
      const result = await sut.divine([payload])
      expect(result).toBeArrayOfSize(1)
      const actual = result.filter(isValuePayload)[0]
      expect(actual).toBeDefined()
      expect(actual.value).toBeObject()
      expect(actual).toEqual(expected)
    })
  })
})
