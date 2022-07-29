import { XyoPayload } from '@xyo-network/payload'

export interface XyoPluginPayload extends XyoPayload {
  type: 'witness'
  language?: 'swift' | 'kotlin' | 'js' | string
  uri?: string
}
