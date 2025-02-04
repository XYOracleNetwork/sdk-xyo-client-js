/* eslint-disable sonarjs/no-hardcoded-passwords */
import '@xylabs/vitest-extended'

import type { AccountInstance } from '@xyo-network/account'
import { Account } from '@xyo-network/account'
import type { Transform } from '@xyo-network/diviner-transform-model'
import { TransformDivinerConfigSchema } from '@xyo-network/diviner-transform-model'
import type { Payload } from '@xyo-network/payload-model'
import type { Value } from '@xyo-network/value-payload-plugin'
import { isValuePayload, ValueSchema } from '@xyo-network/value-payload-plugin'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import { MemoryTransformDiviner } from '../src/index.ts'

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

/**
 * @group module
 * @group diviner
 */

describe('MemoryTransformDiviner', () => {
  let sut: MemoryTransformDiviner
  let account: AccountInstance
  beforeAll(async () => {
    account = await Account.random()
  })
  describe('divine', () => {
    it.each(cases)('should transform the input according to the transform', async (transform, payload, expected) => {
      const config = { schema: TransformDivinerConfigSchema, transform: transform.transform }
      sut = await MemoryTransformDiviner.create({ account, config })
      const result = await sut.divine([payload])
      expect(result).toBeArrayOfSize(1)
      const actual = result.find(isValuePayload)
      expect(actual).toBeDefined()
      expect(actual?.value).toBeObject()
      expect(actual).toMatchObject(expected)
    })
  })
})
