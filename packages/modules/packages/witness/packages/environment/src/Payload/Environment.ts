import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

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

export const isEnvironmentPayload = isPayloadOfSchemaType<Environment>(EnvironmentSchema)
