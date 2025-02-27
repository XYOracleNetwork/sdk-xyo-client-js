import { Logger } from '@xylabs/logger'
import { Schema } from '@xyo-network/payload-model'

export interface PayloadBuilderOptions {
  readonly logger?: Logger
  readonly schema: Schema
}
