import { AnyObject, WithAdditional } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'

import { ValueSchema } from './Schema'

export type ValueInstance = string | undefined

export type Value<T extends AnyObject | undefined = undefined> = WithAdditional<
  Payload<{
    schema: ValueSchema
    value: ValueInstance
  }>,
  T
>
