import { AnyObject, WithAdditional } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'

import { ValueSchema } from './Schema'

export type ValuePayload<T extends AnyObject | undefined = undefined> = WithAdditional<
  Payload<{
    schema: ValueSchema
    value: string | undefined
  }>,
  T
>
