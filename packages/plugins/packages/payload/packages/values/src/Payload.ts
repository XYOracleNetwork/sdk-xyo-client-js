import { AnyObject, WithAdditional } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'

import { ValuesSchema } from './Schema'

export type ValuesPayload<T extends AnyObject | undefined = undefined> = WithAdditional<
  Payload<{
    schema: ValuesSchema
    values: string | undefined
  }>,
  T
>
