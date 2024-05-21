import { Payload } from '@xyo-network/payload-model'

export type PluginPayload = Payload<{
  language?: 'swift' | 'kotlin' | 'js' | string
  schema: 'network.xyo.plugin'
  type: 'witness'
  uri?: string
}>
