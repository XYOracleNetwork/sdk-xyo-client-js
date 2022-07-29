import { XyoPayload } from '@xyo-network/payload'

import { Archivist } from './model'
import { XyoPayloadFindQuery } from './XyoPayloadFindFilter'

export type XyoArchivist<T extends XyoPayload = XyoPayload> = Archivist<T, T, T, T, XyoPayloadFindQuery>
