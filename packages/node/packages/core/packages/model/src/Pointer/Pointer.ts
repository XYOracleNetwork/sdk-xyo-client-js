import { Payload } from '@xyo-network/payload-model'

import { PayloadRule } from './PayloadRules'

export type PointerPayload = Payload<{
  reference: PayloadRule[][]
}>
