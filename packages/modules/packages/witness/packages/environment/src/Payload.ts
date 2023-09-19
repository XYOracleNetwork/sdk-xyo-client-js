import { Payload } from '@xyo-network/payload-model'

export const EnvironmentSchema = 'network.xyo.environment'
export type EnvironmentSchema = typeof EnvironmentSchema

export type TimeStamp = Payload<
  {
    environment: number
  },
  EnvironmentSchema
>
