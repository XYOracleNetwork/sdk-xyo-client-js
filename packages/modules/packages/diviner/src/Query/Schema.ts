import { XyoModuleQueryPayloadSchema } from '@xyo-network/module'

import { XyoDivinerDivineQuerySchema } from './Divine'

export type XyoDivinerQuerySchema = XyoDivinerDivineQuerySchema | XyoModuleQueryPayloadSchema
