import { AnyObject, WithAdditional } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'

import { ConfigSchema } from './Schema'

export type ConfigPayload<T extends AnyObject | undefined = undefined> = WithAdditional<
  Payload<{
    config: string
    schema: ConfigSchema
  }>,
  T
>
