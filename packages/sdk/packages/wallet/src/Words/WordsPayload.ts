import { Payload } from '@xyo-network/payload-model'

export type XyoWordsSchema = 'network.xyo.words'
export const XyoWordsSchema: XyoWordsSchema = 'network.xyo.words'

export type XyoWordsPayload = Payload<{
  schema: XyoWordsSchema
  words: string[]
}>
