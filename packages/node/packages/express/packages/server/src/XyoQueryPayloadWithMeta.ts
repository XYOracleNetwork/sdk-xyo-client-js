import { XyoQuery } from '@xyo-network/module-model'
import { XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { XyoPayload } from '@xyo-network/payload-model'

export type XyoQueryPayloadWithMeta<T extends XyoPayload = XyoPayload> = XyoPayloadWithMeta<XyoQuery<T & { _queryId?: string }>>
