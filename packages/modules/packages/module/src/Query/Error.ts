import { XyoPayload, XyoPayloadBuilder } from '@xyo-network/payload'

export type XyoErrorSchema = 'network.xyo.error'
export const XyoErrorSchema: XyoErrorSchema = 'network.xyo.error'

export type XyoError = XyoPayload<{ message?: string; schema: XyoErrorSchema; sources: string[] }>

export class XyoErrorBuilder extends XyoPayloadBuilder {
  message?: string
  sources: string[]
  constructor(sources: string[], message?: string) {
    super({ schema: XyoErrorSchema })
    this.sources = sources
    this.message = message
  }

  override build(): XyoError {
    return {
      message: this.message,
      schema: XyoErrorSchema,
      sources: this.sources,
    }
  }
}
