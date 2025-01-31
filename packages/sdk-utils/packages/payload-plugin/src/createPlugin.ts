import { assertEx } from '@xylabs/assert'
import type { EmptyObject } from '@xylabs/object'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type {
  AnyPayload, Payload, Schema,
} from '@xyo-network/payload-model'
import { PayloadValidator } from '@xyo-network/payload-validator'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import type { PayloadPlugin } from './Plugin.ts'

export const defaultPayloadPluginFunctions = <TFields extends Payload | EmptyObject,
  TSchema extends Schema = TFields extends Payload ? TFields['schema'] : Schema>(schema: TSchema): PayloadPlugin<TFields, TSchema> => {
  return {
    build: (): PayloadBuilder<TFields, TSchema> => {
      return new PayloadBuilder<TFields, TSchema>({ schema })
    },
    schema,
    validate: (payload: Payload<TFields, TSchema>): PayloadValidator<TFields, TSchema> => {
      return new PayloadValidator<TFields, TSchema>(payload as Payload<TFields, TSchema>)
    },
    wrap: (payload: Payload<TFields, TSchema>): PayloadWrapper<TFields, TSchema> => {
      return PayloadWrapper.wrap<TFields, TSchema>(payload)
    },
  }
}

export const createPayloadPlugin = <TPayload extends Payload = AnyPayload>(plugin: PayloadPlugin<TPayload, TPayload['schema']>):
PayloadPlugin<TPayload, TPayload['schema']> => {
  return {
    ...defaultPayloadPluginFunctions<TPayload, TPayload['schema']>(assertEx(plugin.schema, () => 'schema field required to create plugin')),
    ...plugin,
  }
}
