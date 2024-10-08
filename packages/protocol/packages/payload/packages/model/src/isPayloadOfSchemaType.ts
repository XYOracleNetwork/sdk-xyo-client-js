import { isAnyPayload } from './isPayload.ts'
import type { WithMeta } from './Meta.ts'
import type { Payload, WithSources } from './Payload.ts'

export const isPayloadOfSchemaType = <T extends Payload>(schema: string) => {
  return (x?: unknown | null): x is T => isAnyPayload(x) && x?.schema === schema
}

export const isPayloadOfSchemaTypeWithMeta = <T extends Payload>(schema: string) => {
  return (x?: unknown | null): x is WithMeta<T> => isPayloadOfSchemaType<WithMeta<T>>(schema)(x) && x.$hash !== undefined
}

export const isPayloadOfSchemaTypeWithSources = <T extends Payload>(schema: string) => {
  return (x?: unknown | null): x is WithSources<T> =>
    isPayloadOfSchemaType<WithSources<T>>(schema)(x) && x.sources !== undefined && Array.isArray(x.sources)
}

export const notPayloadOfSchemaType = <T extends Payload>(schema: string) => {
  return (x?: unknown | null): x is T => !isAnyPayload(x) || x?.schema !== schema
}

// test types -- keep for future validation, but comment out

/*
type TestSchema = 'network.xyo.test'
const TestSchema: TestSchema = 'network.xyo.test'

type Test = Payload<{ field: string }, TestSchema>

const testPayload: Test = { field: 'test', schema: TestSchema }
const testWithMeta: WithMeta<Test> = { $hash: '1234abcd', $meta: { timestamp: Date.now() }, field: 'test', schema: TestSchema }

const testPayloads: Payload[] = [testPayload]
const testMetaPayloads: WithMeta<Payload>[] = [testWithMeta]

const testType: Test = testWithMeta

const isTest: Test[] = testPayloads.filter(isPayloadOfSchemaType(TestSchema))
const isTestFromMeta: Payload[] = testMetaPayloads.filter(isPayloadOfSchemaType(TestSchema))
const isTestFromMetaWithMeta: PayloadWithMeta[] = testMetaPayloads.filter(isPayloadOfSchemaType(TestSchema))

const isTestFromMetaTyped = testMetaPayloads.filter(isPayloadOfSchemaType<Test>(TestSchema))

const isTestFromMetaTypedWithMeta: WithMeta<Test>[] = testMetaPayloads.filter(isPayloadOfSchemaType(TestSchema))

const isTestWithMeta: WithMeta<Test>[] = testPayloads.filter(isPayloadOfSchemaTypeWithMeta(TestSchema))
const isTestWithMetaFromMeta: WithMeta<Test>[] = testMetaPayloads.filter(isPayloadOfSchemaTypeWithMeta(TestSchema))
*/
