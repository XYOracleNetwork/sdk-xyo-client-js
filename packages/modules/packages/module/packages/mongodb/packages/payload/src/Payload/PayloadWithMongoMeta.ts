import type { Payload } from '@xyo-network/payload-model'

import type { PayloadMongoMeta } from './PayloadMongoMeta.ts'

export type PayloadWithMongoMeta<T extends Payload = Payload> = T & PayloadMongoMeta
export type PayloadWithPartialMongoMeta<T extends Payload = Payload> = T & Partial<PayloadMongoMeta>
