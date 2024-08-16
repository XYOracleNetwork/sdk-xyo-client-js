import type { Payload } from '@xyo-network/payload-model'

import type { TransformDivinerSchema } from '../Schema.ts'

export type TransformDictionary = { [key: string]: string }

export type Transform = Payload<
  {
    // TODO: Allow dest schema?
    // destinationSchema: string
    // TODO: Make Plural?
    transform: TransformDictionary
  },
  TransformDivinerSchema
>
