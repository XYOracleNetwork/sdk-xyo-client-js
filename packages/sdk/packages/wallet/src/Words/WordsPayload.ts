import { XyoPayload } from '@xyo-network/payload'

export type XyoWordsPayloadSchema = 'network.xyo.words'
export const XyoWordsPayloadSchema: XyoWordsPayloadSchema = 'network.xyo.words'

export type XyoWordsPayload = XyoPayload<{
  schema: XyoWordsPayloadSchema
  words: string[]
}>
