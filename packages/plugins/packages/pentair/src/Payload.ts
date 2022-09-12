import { XyoPayload } from '@xyo-network/payload'

import { XyoPentairScreenlogicSchema } from './Schema'
import { PoolConfigJson, PoolStatus } from './screenlogic'

export type XyoPentairScreenlogicPayload = XyoPayload<{
  schema: XyoPentairScreenlogicSchema
  config?: Partial<PoolConfigJson>
  status?: Partial<PoolStatus>
}>
