import type { EmptyObject, WithAdditional } from '@xylabs/object'
import type { DivinerConfig } from '@xyo-network/diviner-model'
import type { Schema } from '@xyo-network/payload-model'

import { PayloadDivinerSchema } from './Schema.ts'

export type PayloadDivinerConfigSchema = `${PayloadDivinerSchema}.config`
export const PayloadDivinerConfigSchema: PayloadDivinerConfigSchema = `${PayloadDivinerSchema}.config`

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
