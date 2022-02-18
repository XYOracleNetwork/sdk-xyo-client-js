import { XyoPayload } from '../../models'

export interface XyoIdPayload extends XyoPayload {
  salt: string
}
