import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { v4 } from 'uuid'

import { knownPayload } from './getKnownPayload'
import { schema } from './schema'

export const getPayload = (): Payload => {
  const fields = { ...knownPayload, uid: v4() }
  return new PayloadBuilder({ schema }).fields(fields).build()
}

export const getPayloads = (numPayloads: number) => {
  return new Array(numPayloads).fill(0).map(getPayload)
}
