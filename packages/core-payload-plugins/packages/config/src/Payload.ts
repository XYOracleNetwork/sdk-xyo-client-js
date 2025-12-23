import type { AnyObject, WithAdditional } from '@xylabs/sdk-js'
import type { Payload } from '@xyo-network/payload-model'

import type { ConfigSchema } from './Schema.ts'

export type ConfigPayload<T extends AnyObject | undefined = undefined> = WithAdditional<
  Payload<{
    config: string
    schema: ConfigSchema
  }>,
  T
>
