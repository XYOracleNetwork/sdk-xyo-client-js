import { Payload } from '../Payload'
import { WithMeta } from '../Meta'

const TestPayloadSchema = 'com.test.schema'
type TestPayloadSchema = typeof TestPayloadSchema

type TestPayload = Payload<{ data: { foo: string } }, TestPayloadSchema>

/* These tests are just to see if casting works as expected */

describe.skip('Payload Types', () => {
  describe('WithMeta', () => {
    const payload: TestPayload = { schema: 'com.test.schema', data: { foo: 'bar' } }
    const payloadWithMeta: WithMeta<TestPayload> = { schema: 'com.test.schema', data: { foo: 'bar' }, $hash: '123', $meta: { test: 'yo' } }
    const payloadFromWithMeta: TestPayload = payloadWithMeta
    expect(payload).toBeDefined()
    expect(payloadFromWithMeta).toBeDefined()
  })
})
