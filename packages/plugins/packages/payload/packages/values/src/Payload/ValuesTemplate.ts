import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { ValuesSchema } from '../Schema'

export const ValuesTemplateSchema = `${ValuesSchema}.template`
export type ValuesTemplateSchema = typeof ValuesTemplateSchema

export type ValuesTemplate = Payload<
  {
    placeholders: {
      [key: string]: string
    }
    template: string
  },
  ValuesTemplateSchema
>

export const isValuesTemplatePayload = isPayloadOfSchemaType<ValuesTemplate>(ValuesTemplateSchema)
