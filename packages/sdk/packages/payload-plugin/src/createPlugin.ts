import { assertEx } from '@xylabs/assert'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { PayloadValidator } from '@xyo-network/payload-validator'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { PayloadPlugin } from './Plugin'

export const defaultPayloadPluginFunctions = <T extends Payload>(schema: string): PayloadPlugin<T> => {
  return {
    build: (): PayloadBuilder<T> => {
      return new PayloadBuilder<T>({ schema })
    },
    schema,
    validate: (payload: Payload): PayloadValidator<T> => {
      return new PayloadValidator<T>(payload as T)
    },
    wrap: (payload: Payload): PayloadWrapper<T> => {
      return PayloadWrapper.wrap<T>(payload as T)
    },
  }
}

export const createPayloadPlugin = <TPayload extends Payload = Payload>(plugin: PayloadPlugin<TPayload>): PayloadPlugin<TPayload> => {
  return {
    ...defaultPayloadPluginFunctions<TPayload>(assertEx(plugin.schema, 'schema field required to create plugin')),
    ...plugin,
  }
}
