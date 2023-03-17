import { Payload } from '@xyo-network/payload-model'

import { XyoPentairScreenlogicSchema } from './Schema'
import { PoolConfigJson, PoolStatus } from './screenlogic'

export type XyoPentairScreenlogicPayload = Payload<{
  config?: Partial<PoolConfigJson>
  schema: XyoPentairScreenlogicSchema
  status?: Partial<PoolStatus>
}>
