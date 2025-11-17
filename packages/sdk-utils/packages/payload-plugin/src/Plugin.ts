import type { Validator } from '@xylabs/object'
import type { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload } from '@xyo-network/payload-model'
import type { PayloadWrapper } from '@xyo-network/payload-wrapper'
// eslint-disable-next-line import-x/no-internal-modules
import type { SomeJSONSchema } from 'ajv/dist/types/json-schema.js'

export type PayloadPluginFunc<TPayload extends Payload = Payload> = () => PayloadPlugin<TPayload>

export type PayloadPlugin<TPayload extends Payload = Payload> = {
  build?: () => PayloadBuilder<TPayload>
  jsonSchema?: SomeJSONSchema
  schema: TPayload['schema']
  template?: () => Partial<TPayload>
  validate?: (payload: Payload) => Validator<Payload>
  wrap?: (payload: Payload) => PayloadWrapper
}

/* We use PartialWitnessConfig to allow people to config witnesses without having to pass in all the schema info */
