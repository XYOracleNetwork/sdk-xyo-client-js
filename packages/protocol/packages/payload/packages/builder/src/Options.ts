import type { Logger } from '@xylabs/logger'
import type { EmptyObject, JsonObject } from '@xylabs/object'
import type {
  Schema, WithoutMeta, WithoutSchema,
} from '@xyo-network/payload-model'

export interface PayloadBuilderOptions<T extends EmptyObject = EmptyObject> {
  readonly fields?: WithoutMeta<WithoutSchema<T>>
  readonly logger?: Logger
  readonly meta?: JsonObject
  readonly schema: Schema
}
