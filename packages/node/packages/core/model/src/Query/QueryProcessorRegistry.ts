import { XyoPayload } from '@xyo-network/payload'

import { Query } from './Query'
import { QueryProcessor } from './QueryProcessor'

export interface QueryProcessorRegistry<T extends Query = Query, R extends XyoPayload = XyoPayload> {
  processors: Readonly<Record<string, QueryProcessor<T, R>>>
  registerProcessorForSchema: (schema: string, processor: QueryProcessor<T, R>) => void
}
