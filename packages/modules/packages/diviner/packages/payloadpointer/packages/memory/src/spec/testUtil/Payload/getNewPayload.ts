import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { v4 as uuid } from 'uuid'

import { schema } from './schema.js'

export const getNewPayload = async (): Promise<Payload> => {
  const fields = { schema: 'network.xyo.id', salt: uuid() }
  return await new PayloadBuilder({ schema }).fields(fields).build()
}

export const getNewPayloads = async (numPayloads: number) => {
  return await Promise.all(Array.from({ length: numPayloads }).fill(0).map(getNewPayload))
}
