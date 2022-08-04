import { XyoPayload } from '@xyo-network/payload'

export type XyoPluginPayload = XyoPayload<{
  schema: 'network.xyo.plugin'
  type: 'witness'
  language?: 'swift' | 'kotlin' | 'js' | string
  uri?: string
}>
