import type { Payload } from '@xyo-network/payload-model'

import type { PayloadWithMongoMeta } from '../Payload/index.ts'

export type BoundWitnessMongoMeta<P extends Payload = Payload> = PayloadWithMongoMeta<
  P & {
    // _payloads?: PayloadWithPartialMongoMeta<P>[]
    __source_ip?: string
    __user_agent?: string
  }
>
