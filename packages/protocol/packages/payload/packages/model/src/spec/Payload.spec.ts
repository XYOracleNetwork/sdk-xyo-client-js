import type { WithMeta } from '../Meta.ts'
import type { Payload } from '../Payload.ts'

const TestPayloadSchema = 'com.test.schema'
type TestPayloadSchema = typeof TestPayloadSchema

type TestPayload = Payload<{ data: { foo: string } }, TestPayloadSchema>

/* These tests are just to see if casting works as expected */

describe('Payload Types', () => {
  it('WithMeta', () => {
    const payload: TestPayload = { data: { foo: 'bar' }, schema: 'com.test.schema' }
    const payloadWithMeta: WithMeta<TestPayload> = { $hash: '123', $meta: { test: 'yo' }, data: { foo: 'bar' }, schema: 'com.test.schema' }
    const payloadFromWithMeta: TestPayload = payloadWithMeta
    expect(payload).toBeDefined()
    expect(payloadFromWithMeta).toBeDefined()
  })
})
