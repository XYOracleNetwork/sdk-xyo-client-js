import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { v4 as uuid } from 'uuid'

import { schema } from './schema.ts'

export const getNewPayload = (): Payload => {
  const fields = { schema: 'network.xyo.id', salt: uuid() }
  return new PayloadBuilder({ schema }).fields(fields).build()
}

export const getNewPayloads = (numPayloads: number) => {
  return Array.from({ length: numPayloads }).fill(0).map(getNewPayload)
}
