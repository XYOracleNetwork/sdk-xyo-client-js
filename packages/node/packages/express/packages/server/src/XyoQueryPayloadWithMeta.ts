import { XyoQuery } from '@xyo-network/module-model'
import { PayloadWithMeta } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'

export type XyoQueryPayloadWithMeta<T extends Payload = Payload> = PayloadWithMeta<XyoQuery<T & { _queryId?: string }>>
