/* eslint-disable sonarjs/no-duplicate-string */
import { WithMeta } from '../Meta.js'
import { Payload } from '../Payload.js'

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
