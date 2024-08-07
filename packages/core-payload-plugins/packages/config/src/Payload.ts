import { AnyObject, WithAdditional } from '@xylabs/object'
import { Payload } from '@xyo-network/payload-model'

import { ConfigSchema } from './Schema.ts'

export type ConfigPayload<T extends AnyObject | undefined = undefined> = WithAdditional<
  Payload<{
    config: string
    schema: ConfigSchema
  }>,
  T
>
