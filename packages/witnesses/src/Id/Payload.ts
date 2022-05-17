import { XyoPayload } from '@xyo-network/core'

export interface XyoIdPayload extends XyoPayload {
  salt: string
}
