import type { Validator } from '@xylabs/object'
import type { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload } from '@xyo-network/payload-model'
import type { PayloadWrapper } from '@xyo-network/payload-wrapper'

export type PayloadPluginFunc<TPayload extends Payload = Payload> = () => PayloadPlugin<TPayload>

export type PayloadPlugin<TPayload extends Payload = Payload> = {
  build?: () => PayloadBuilder<TPayload>
  jsonSchema?: object
  schema: TPayload['schema']
  template?: () => Partial<TPayload>
  validate?: (payload: Payload) => Validator<Payload>
  wrap?: (payload: Payload) => PayloadWrapper
}

/* Note: We use PartialWitnessConfig to allow people to config witnesses without having to pass in all the schema info */
