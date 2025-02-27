import { Payload } from '@xyo-network/payload-model'

import { PayloadRule } from './PayloadRules/index.ts'

export type PointerPayload = Payload<{
  reference: PayloadRule[][]
}>
