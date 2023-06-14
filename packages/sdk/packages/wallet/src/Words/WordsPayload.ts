import { Payload } from '@xyo-network/payload-model'

export type WordsSchema = 'network.xyo.words'
export const WordsSchema: WordsSchema = 'network.xyo.words'

export type WordsPayload = Payload<{
  schema: WordsSchema
  words: string[]
}>
