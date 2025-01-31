import type { Logger } from '@xylabs/logger'
import type { Schema } from '@xyo-network/payload-model'

export interface PayloadBuilderOptions<TSchema extends Schema = Schema> {
  readonly logger?: Logger
  readonly schema: TSchema
}
