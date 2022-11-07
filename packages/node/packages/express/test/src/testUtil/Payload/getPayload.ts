import { XyoPayload, XyoPayloadBuilder } from '@xyo-network/payload'
import { v4 } from 'uuid'

import { knownPayload } from './getKnown'
import { schema } from './schema'

export const getPayload = (): XyoPayload => {
  const fields = { ...knownPayload, uid: v4() }
  return new XyoPayloadBuilder({ schema }).fields(fields).build()
}
