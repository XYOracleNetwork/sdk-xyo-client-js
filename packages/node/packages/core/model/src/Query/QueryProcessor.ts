import { XyoPayload } from '@xyo-network/payload'

import { Optional } from '../Optional'
import { XyoPayloadWithPartialMeta } from '../Payload'
import { Query } from './Query'

export type QueryProcessor<T extends Query = Query, R extends XyoPayload = XyoPayload> = (
  payload: T,
) => Promise<Optional<XyoPayloadWithPartialMeta<R>>>
