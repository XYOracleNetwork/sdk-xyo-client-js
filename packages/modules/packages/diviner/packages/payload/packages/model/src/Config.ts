import { EmptyObject, WithAdditional } from '@xylabs/object'
import { DivinerConfig } from '@xyo-network/diviner-model'
import { Schema } from '@xyo-network/payload-model'

import { PayloadDivinerSchema } from './Schema.js'

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
  TSchema extends void ? PayloadDivinerConfigSchema : TSchema
>
