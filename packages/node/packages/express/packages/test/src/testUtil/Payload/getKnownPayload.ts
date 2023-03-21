import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { schema } from './schema'

export const knownPayload = new PayloadBuilder<Payload<Record<string, unknown>>>({ schema })
  .fields({
    balance: 10000.0,
    daysOld: 1,
    deviceId: '00000000-0000-0000-0000-000000000000',
    geomines: 41453,
    planType: 'pro',
    uid: '0000000000000000000000000000',
  })
  .build()

export const knownPayloadHash = new PayloadWrapper(knownPayload).hash
