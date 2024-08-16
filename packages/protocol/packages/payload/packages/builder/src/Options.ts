import type { Logger } from '@xylabs/logger'
import type { JsonObject } from '@xylabs/object'
import type { Schema } from '@xyo-network/payload-model'

export interface PayloadBuilderOptions<T> {
  readonly fields?: Omit<T, 'schema' | '$hash' | '$meta'>
  readonly logger?: Logger
  readonly meta?: JsonObject
  readonly schema: Schema
}
