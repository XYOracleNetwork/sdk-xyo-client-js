import { XyoModuleQueryPayload } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

import { XyoDivinerDivineQueryPayload } from './Divine'

export type XyoDivinerQueryPayload<T extends XyoPayload = XyoPayload> = XyoDivinerDivineQueryPayload<T> | XyoModuleQueryPayload
