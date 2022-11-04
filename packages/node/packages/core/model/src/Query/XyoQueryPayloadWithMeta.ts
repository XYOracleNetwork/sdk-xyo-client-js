import { XyoQuery } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

import { XyoPayloadWithMeta } from '../Payload'

export type XyoQueryPayloadWithMeta<T extends XyoPayload = XyoPayload> = XyoPayloadWithMeta<XyoQuery<T & { _queryId?: string }>>
