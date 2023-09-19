import { Payload } from '@xyo-network/payload-model'

import { EnvironmentSchema } from '../Schema'

export interface EnvironmentVariables {
  [key: string]: string | undefined
}

export type Environment = Payload<
  {
    env: EnvironmentVariables
  },
  EnvironmentSchema
>
