import { XyoQuery } from '@xyo-network/module'
import { XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { XyoPayload } from '@xyo-network/payload'

export type XyoQueryPayloadWithMeta<T extends XyoPayload = XyoPayload> = XyoPayloadWithMeta<XyoQuery<T & { _queryId?: string }>>
