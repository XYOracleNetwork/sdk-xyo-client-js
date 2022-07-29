import { XyoPayload } from '@xyo-network/payload'

export interface XyoIdPayload extends XyoPayload {
  salt: string
}
