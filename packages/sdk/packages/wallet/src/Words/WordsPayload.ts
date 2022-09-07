import { XyoPayload } from '@xyo-network/payload'

export type XyoWordsSchema = 'network.xyo.words'
export const XyoWordsSchema: XyoWordsSchema = 'network.xyo.words'

export type XyoWordsPayload = XyoPayload<{
  schema: XyoWordsSchema
  words: string[]
}>
