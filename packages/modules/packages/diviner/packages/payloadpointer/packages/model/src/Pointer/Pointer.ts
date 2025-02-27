import type { Payload } from '@xyo-network/payload-model'

import type { PayloadRule } from './PayloadRules/index.ts'

export type PointerPayload = Payload<{
  reference: PayloadRule[][]
}>
