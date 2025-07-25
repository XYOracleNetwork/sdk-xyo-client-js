import '@xylabs/vitest-extended'

import { hexFrom } from '@xylabs/hex'
import type { BigIntPayload } from '@xyo-network/diviner-range-model'
import {
  BigIntSchema, NumberSchema, RangeSchema,
} from '@xyo-network/diviner-range-model'
import {
  describe, expect, it,
} from 'vitest'

import { RangeDiviner } from '../Diviner.ts'
describe('RangeDiviner', () => {
  it('Number', async () => {
    const diviner = await RangeDiviner.create({ account: 'random' })
    const payloads = await diviner.divine([{
      count: 20, schema: RangeSchema, start: 10,
    }])
    expect(payloads).toBeArrayOfSize(20)
    expect(payloads[0].schema).toBe(NumberSchema)
    expect(payloads[0].value).toBe(10)
    expect(payloads[19].value).toBe(29)
  })
  it('BigInt', async () => {
    const diviner = await RangeDiviner.create({ account: 'random' })
    const payloads = await diviner.divine([
      {
        count: 30,
        schema: RangeSchema,
        start: hexFrom(5_438_763_487_593_657_435_334_534n, { prefix: true }),
      },
    ])
    expect(payloads[0].schema).toBe(BigIntSchema)
    expect(payloads).toBeArrayOfSize(30)
    expect(BigInt((payloads[0] as BigIntPayload).value)).toBe(5_438_763_487_593_657_435_334_534n)
    expect(BigInt((payloads[29] as BigIntPayload).value)).toBe(5_438_763_487_593_657_435_334_534n + 29n)
  })
})
