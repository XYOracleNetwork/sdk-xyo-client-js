import '@xylabs/vitest-extended'

import {
  describe, expect, it,
} from 'vitest'
import z from 'zod'

import { isPayloadOfZodType } from '../isPayloadOfZodType.ts'
import type { Payload } from '../Payload.ts'

const TestPayloadSchema = 'com.test.schema'
type TestPayloadSchema = typeof TestPayloadSchema

type TestPayload = Payload<{ data: { foo: string } }, TestPayloadSchema>

const TestPayloadZod = z.object({ data: z.object({ foo: z.string() }) })

/* These tests are just to see if casting works as expected */

describe('isPayloadOfZodType', () => {
  it('WithMeta', () => {
    const payload: TestPayload = { data: { foo: 'bar' }, schema: 'com.test.schema' }
    const payloadWithMeta: TestPayload = {
      $hash: '123', $meta: { test: 'yo' }, data: { foo: 'bar' }, schema: 'com.test.schema',
    } as TestPayload
    const payloadFromWithMeta: TestPayload = payloadWithMeta
    expect(payload).toBeDefined()
    expect(payloadFromWithMeta).toBeDefined()
    const identity = isPayloadOfZodType<TestPayload>(TestPayloadSchema, TestPayloadZod)
    expect(identity(payload)).toBeTrue()
    expect(identity(payloadWithMeta)).toBeTrue()
  })
})
