import { XyoPayload } from '@xyo-network/payload'

export interface XyoWordsPayload extends XyoPayload {
  words: string[]
}
