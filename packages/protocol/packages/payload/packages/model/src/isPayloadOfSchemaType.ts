import { isAnyPayload } from './isPayload.ts'
import type { Payload, WithSources } from './Payload.ts'

export const isPayloadOfSchemaType = <T extends Payload>(schema: string) => {
  return (x?: unknown | null): x is T => isAnyPayload(x) && x?.schema === schema
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

const testPayloads: Payload[] = [testPayload]

const isTest: Test[] = testPayloads.filter(isPayloadOfSchemaType(TestSchema))

const isTestFromMetaTyped = testMetaPayloads.filter(isPayloadOfSchemaType<Test>(TestSchema))
*/
