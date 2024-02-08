import { Logger } from '@xylabs/logger'
import { JsonObject } from '@xylabs/object'
import { Schema } from '@xyo-network/payload-model'

export interface PayloadBuilderOptions<T> {
  readonly fields?: Omit<T, 'schema' | '$hash' | '$meta'>
  readonly logger?: Logger
  readonly meta?: JsonObject
  readonly schema: Schema
}
