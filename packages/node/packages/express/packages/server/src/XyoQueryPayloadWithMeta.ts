import { Query } from '@xyo-network/module-model'
import { PayloadWithMeta } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'

export type QueryPayloadWithMeta<T extends Payload = Payload> = PayloadWithMeta<Query<T & { _queryId?: string }>>
