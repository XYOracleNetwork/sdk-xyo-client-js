import { XyoModuleQuery } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

import { XyoDivinerDivineQuery } from './Divine'

export type XyoDivinerQuery<T extends XyoPayload = XyoPayload> = XyoDivinerDivineQuery<T> | XyoModuleQuery
