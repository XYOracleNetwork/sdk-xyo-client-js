import { XyoModule } from '@xyo-network/module'

import { XyoArchivistQueryPayload } from './Query'

export type XyoArchivist<Q extends XyoArchivistQueryPayload = XyoArchivistQueryPayload> = XyoModule<Q>
