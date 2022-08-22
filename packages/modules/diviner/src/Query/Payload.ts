import { XyoModuleQueryPayload } from '@xyo-network/module'

import { XyoDivinerDivineQueryPayload } from './Divine'

export type XyoDivinerQueryPayload = XyoDivinerDivineQueryPayload | XyoModuleQueryPayload
