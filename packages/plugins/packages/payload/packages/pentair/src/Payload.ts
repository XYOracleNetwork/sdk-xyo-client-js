import { XyoPayload } from '@xyo-network/payload-model'

import { XyoPentairScreenlogicSchema } from './Schema'
import { PoolConfigJson, PoolStatus } from './screenlogic'

export type XyoPentairScreenlogicPayload = XyoPayload<{
  config?: Partial<PoolConfigJson>
  schema: XyoPentairScreenlogicSchema
  status?: Partial<PoolStatus>
}>
