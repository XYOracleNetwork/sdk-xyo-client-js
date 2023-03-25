import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'

export type ModuleErrorSchema = 'network.xyo.error.module'
export const ModuleErrorSchema: ModuleErrorSchema = 'network.xyo.error.module'

export type ModuleError = Payload<{ message?: string; schema: ModuleErrorSchema; sources: string[] }>

export class XyoErrorBuilder extends PayloadBuilder {
  message?: string
  sources: string[]
  constructor(sources: string[], message?: string) {
    super({ schema: ModuleErrorSchema })
    this.sources = sources
    this.message = message
  }

  override build(): ModuleError {
    return {
      message: this.message,
      schema: ModuleErrorSchema,
      sources: this.sources,
    }
  }
}
