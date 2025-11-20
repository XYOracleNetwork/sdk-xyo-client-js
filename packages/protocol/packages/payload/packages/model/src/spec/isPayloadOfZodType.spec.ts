import '@xylabs/vitest-extended'

import {
  describe, expect, it,
} from 'vitest'
import z from 'zod'

import { isPayloadOfZodType } from '../isPayloadOfZodType.ts'
import type { Payload } from '../Payload.ts'
import { asSchema } from '../Schema.ts'

const TestPayloadSchema = asSchema('com.test.schema', true)
type TestPayloadSchema = typeof TestPayloadSchema

type TestPayload = Payload<{ data: { foo: string } }, TestPayloadSchema>

const TestPayloadZod = z.object({ data: z.object({ foo: z.string() }) })

/* These tests are just to see if casting works as expected */

describe('isPayloadOfZodType', () => {
  const payload: TestPayload = { data: { foo: 'bar' }, schema: TestPayloadSchema }
  const payloadWithMeta: TestPayload = {
    $hash: '123', $meta: { test: 'yo' }, data: { foo: 'bar' }, schema: TestPayloadSchema,
  } as TestPayload
  it('with schema supplied', () => {
    const identity = isPayloadOfZodType<TestPayload>(TestPayloadZod, TestPayloadSchema)
    expect(identity(payload)).toBeTrue()
    expect(identity(payloadWithMeta)).toBeTrue()
  })
  it('without schema supplied', () => {
    const identity = isPayloadOfZodType<TestPayload>(TestPayloadZod)
    expect(identity(payload)).toBeTrue()
    expect(identity(payloadWithMeta)).toBeTrue()
  })
})
