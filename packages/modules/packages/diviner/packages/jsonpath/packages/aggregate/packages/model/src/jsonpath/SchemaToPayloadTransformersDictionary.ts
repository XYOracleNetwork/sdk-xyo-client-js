import { PayloadTransformer } from './PayloadTransformer.ts'

/**
 * A dictionary of schema to payload transformers
 */
export type SchemaToPayloadTransformersDictionary = { [schema: string]: PayloadTransformer[] }
