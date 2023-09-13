import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { schema } from './schema'

export const knownPayloadPromise = new PayloadBuilder<Payload<Record<string, unknown>>>({ schema })
  .fields({
    balance: 10000.0,
    daysOld: 1,
    deviceId: '00000000-0000-0000-0000-000000000000',
    geomines: 41453,
    planType: 'pro',
    uid: '0000000000000000000000000000',
  })
  .build()

export const knownPayloadHash = async () => await PayloadWrapper.hashAsync(await knownPayloadPromise)

export const nonExistentHash = '4b19d691dd348c711b2e83ed975c8009856e3001a84cdc63b5226124e08eb4af'
