import { Payload } from '@xyo-network/payload-model'

import { PayloadRule } from './PayloadRules/index.js'

export type PointerPayload = Payload<{
  reference: PayloadRule[][]
}>
