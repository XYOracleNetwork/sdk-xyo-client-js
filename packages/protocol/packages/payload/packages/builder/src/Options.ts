import type { Logger } from '@xylabs/logger'
import type { Schema } from '@xyo-network/payload-model'

export interface PayloadBuilderOptions {
  readonly logger?: Logger
  readonly schema: Schema
}
