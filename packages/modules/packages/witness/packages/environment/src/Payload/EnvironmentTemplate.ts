import { Payload } from '@xyo-network/payload-model'

import { EnvironmentSchema } from './Environment'

export const EnvironmentTemplateSchema = `${EnvironmentSchema}.template`
export type EnvironmentTemplateSchema = typeof EnvironmentTemplateSchema

export type EnvironmentTemplate = Payload<
  {
    placeholders: {
      [key: string]: string
    }
    value: string
  },
  EnvironmentTemplateSchema
>
