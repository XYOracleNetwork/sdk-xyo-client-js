import { PayloadTransformer } from './PayloadTransformer.js'

/**
 * A dictionary of schema to payload transformers
 */
export type SchemaToPayloadTransformersDictionary = { [schema: string]: PayloadTransformer[] }
