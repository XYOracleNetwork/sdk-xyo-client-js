import { XyoPayload } from '@xyo-network/core'

export interface XyoPluginPayload extends XyoPayload {
  type: 'witness'
  language?: 'swift' | 'kotlin' | 'js' | string
  uri?: string
}
