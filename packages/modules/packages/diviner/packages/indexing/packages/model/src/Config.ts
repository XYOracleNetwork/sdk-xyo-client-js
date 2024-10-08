import type { EmptyObject, WithAdditional } from '@xylabs/object'
import type { DivinerConfig, SearchableStorage } from '@xyo-network/diviner-model'
import type { Payload } from '@xyo-network/payload-model'

import { IndexingDivinerSchema } from './Schema.ts'
import type { IndexingDivinerStageConfig } from './Stage.ts'

export const IndexingDivinerConfigSchema = `${IndexingDivinerSchema}.config` as const
export type IndexingDivinerConfigSchema = typeof IndexingDivinerConfigSchema

export type IndexingDivinerConfig<TConfig extends Payload | EmptyObject | void = void, TSchema extends string | void = void> = DivinerConfig<
  WithAdditional<
    {
      /**
       * Where the diviner should store it's index
       */
      indexStore?: SearchableStorage
      /**
       * Config section for name/address of individual diviner stages
       */
      indexingDivinerStages?: IndexingDivinerStageConfig
      /**
       * The maximum number of payloads to index at a time
       */
      payloadDivinerLimit?: number
      /**
       * How often to poll for new payloads to index
       */
      pollFrequency?: number
      /**
       * The schema for the Diviner config
       */
      schema: IndexingDivinerConfigSchema
      /**
       * Where the diviner should persist its internal state
       */
      stateStore?: SearchableStorage
    },
    TConfig
  >,
  TSchema
>
