import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'
import { ValueInstance } from '@xyo-network/value-payload-plugin'

import { ValuesSchema } from '../Schema'

export interface ValuesDictionary {
  [key: string]: ValueInstance
}

export type Values = Payload<
  {
    values: ValuesDictionary
  },
  ValuesSchema
>

export const isValuesPayload = isPayloadOfSchemaType<Values>(ValuesSchema)
