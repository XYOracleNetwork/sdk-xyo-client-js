import { XyoModule } from '@xyo-network/module'

import { XyoDivinerQueryPayload } from './Query'

export type XyoDiviner<Q extends XyoDivinerQueryPayload = XyoDivinerQueryPayload> = XyoModule<Q>
