import type { EmptyObject, Validator } from '@xylabs/object'
import type { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload, Schema } from '@xyo-network/payload-model'
import type { PayloadWrapper } from '@xyo-network/payload-wrapper'

export type PayloadPluginFunc<TFields extends Payload | EmptyObject = Payload,
  TSchema extends Schema = TFields extends Payload ? TFields['schema'] : Schema> = () => PayloadPlugin<TFields, TSchema>

export type PayloadPlugin<TFields extends Payload | EmptyObject = Payload, TSchema extends Schema = TFields extends Payload ? TFields['schema'] : Schema> = {
  build?: () => PayloadBuilder<TFields, TSchema>
  jsonSchema?: object
  schema: TSchema
  template?: () => Partial<Payload<TFields, TSchema>>
  validate?: (payload: Payload<TFields, TSchema>) => Validator<Payload<TFields, TSchema>>
  wrap?: (payload: Payload<TFields, TSchema>) => PayloadWrapper
}

/* Note: We use PartialWitnessConfig to allow people to config witnesses without having to pass in all the schema info */
