import { XyoPayload } from '@xyo-network/payload-model'

export type XyoPluginPayload = XyoPayload<{
  language?: 'swift' | 'kotlin' | 'js' | string
  schema: 'network.xyo.plugin'
  type: 'witness'
  uri?: string
}>
