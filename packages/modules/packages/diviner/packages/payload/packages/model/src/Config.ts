import type { EmptyObject, WithAdditional } from '@xylabs/sdk-js'
import type { DivinerConfig } from '@xyo-network/diviner-model'
import { asSchema, type Schema } from '@xyo-network/payload-model'

import { PayloadDivinerSchema } from './Schema.ts'

export const PayloadDivinerConfigSchema = asSchema(`${PayloadDivinerSchema}.config`, true)
export type PayloadDivinerConfigSchema = typeof PayloadDivinerConfigSchema

export type PayloadDivinerConfig<TAdditional extends EmptyObject | void = void, TSchema extends Schema | void = void> = DivinerConfig<
  WithAdditional<
    {
      indexBatchSize?: number
      maxIndexSize?: number
    },
    TAdditional
  >,
  TSchema extends void ? Schema : TSchema
>
