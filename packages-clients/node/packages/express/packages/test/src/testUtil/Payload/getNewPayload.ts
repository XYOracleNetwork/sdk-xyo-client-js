import { uuid } from '@xyo-network/core'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'

import { knownPayload } from './getKnownPayload'
import { schema } from './schema'

export const getNewPayload = (): Payload => {
  const fields = { ...knownPayload, uid: uuid() }
  return new PayloadBuilder({ schema }).fields(fields).build()
}

export const getNewPayloads = (numPayloads: number) => {
  return new Array(numPayloads).fill(0).map(getNewPayload)
}
