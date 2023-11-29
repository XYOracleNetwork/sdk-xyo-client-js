import { PayloadTransformer } from './PayloadTransformer'

/**
 * A dictionary of schema to payload transformers
 */
export type SchemaToPayloadTransformersDictionary = { [key: string]: PayloadTransformer[] }
