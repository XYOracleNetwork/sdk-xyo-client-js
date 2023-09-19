import { Payload } from '@xyo-network/payload-model'

export const EnvironmentTemplateSchema = 'network.xyo.environment.template'
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
