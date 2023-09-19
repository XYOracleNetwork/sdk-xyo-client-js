import { Payload } from '@xyo-network/payload-model'

import { TransformDivinerSchema } from '../Schema'

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
