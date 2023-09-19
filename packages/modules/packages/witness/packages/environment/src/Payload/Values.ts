import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

export const ValuesSchema = 'network.xyo.values'
export type ValuesSchema = typeof ValuesSchema

export interface ValuesDictionary {
  [key: string]: string | undefined
}

export type Values = Payload<
  {
    values: ValuesDictionary
  },
  ValuesSchema
>

export const isValuesPayload = isPayloadOfSchemaType<Values>(ValuesSchema)
