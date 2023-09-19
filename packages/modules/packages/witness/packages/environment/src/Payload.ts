import { Payload } from '@xyo-network/payload-model'

export const EnvironmentSchema = 'network.xyo.environment'
export type EnvironmentSchema = typeof EnvironmentSchema

export interface EnvironmentVariables {
  [key: string]: string | undefined
}

export type Environment = Payload<
  {
    env: EnvironmentVariables
  },
  EnvironmentSchema
>

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
