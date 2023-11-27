import { DivinerConfig } from '@xyo-network/diviner-model'

import { IndexQueryResponseToDivinerQueryResponseDivinerSchema } from './Schema'

export type IndexQueryResponseToDivinerQueryResponseDivinerConfigSchema = `${IndexQueryResponseToDivinerQueryResponseDivinerSchema}.config`
export const IndexQueryResponseToDivinerQueryResponseDivinerConfigSchema: IndexQueryResponseToDivinerQueryResponseDivinerConfigSchema = `${IndexQueryResponseToDivinerQueryResponseDivinerSchema}.config`

export type IndexQueryResponseToDivinerQueryResponseDivinerConfig = DivinerConfig<{
  schema: IndexQueryResponseToDivinerQueryResponseDivinerConfigSchema
}>
