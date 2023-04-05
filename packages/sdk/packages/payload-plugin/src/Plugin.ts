import { Validator } from '@xyo-network/core'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export type PayloadPluginFunc<TPayload extends Payload = Payload> = () => PayloadPlugin<TPayload>

export type PayloadPlugin<TPayload extends Payload = Payload> = {
  build?: () => PayloadBuilder
  jsonSchema?: object
  schema: TPayload['schema']
  template?: () => Partial<TPayload>
  validate?: (payload: Payload) => Validator
  wrap?: (payload: Payload) => PayloadWrapper
}

/* Note: We use PartialWitnessConfig to allow people to config witnesses without having to pass in all the schema info*/
