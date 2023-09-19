import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'
import { Value } from '@xyo-network/value-payload-plugin'

import { ValuesSchema } from './Schema'

export interface ValuesDictionary {
  [key: string]: Value
}

export type Values = Payload<
  {
    values: ValuesDictionary
  },
  ValuesSchema
>

export const isValuesPayload = isPayloadOfSchemaType<Values>(ValuesSchema)
