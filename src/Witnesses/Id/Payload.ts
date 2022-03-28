import { XyoPayload } from '../../core'

export interface XyoIdPayload extends XyoPayload {
  salt: string
}
