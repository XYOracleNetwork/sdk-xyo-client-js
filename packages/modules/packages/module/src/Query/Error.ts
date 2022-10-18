import { XyoPayload, XyoPayloadBuilder } from '@xyo-network/payload'

export type XyoErrorSchema = 'network.xyo.error'
export const XyoErrorSchema: XyoErrorSchema = 'network.xyo.error'

export type XyoError = XyoPayload<{ schema: XyoErrorSchema; source: string; message?: string }>

export class XyoErrorBuilder extends XyoPayloadBuilder {
  source: string
  message?: string
  constructor(source: string, message?: string) {
    super({ schema: XyoErrorSchema })
    this.source = source
    this.message = message
  }

  override build(): XyoError {
    return {
      message: this.message,
      schema: XyoErrorSchema,
      source: this.source,
    }
  }
}
