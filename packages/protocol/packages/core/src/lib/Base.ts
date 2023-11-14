import { Logger } from '@xylabs/logger'
import { AnyObject } from '@xyo-network/object'

export type BaseParamsFields = {
  logger?: Logger
}

export type BaseParams<TAdditionalParams extends AnyObject | void = void> = TAdditionalParams extends AnyObject
  ? BaseParamsFields & TAdditionalParams
  : BaseParamsFields

export abstract class Base<TParams extends BaseParams = BaseParams> {
  static defaultLogger?: Logger

  constructor(readonly params: TParams) {
    params.logger?.debug(`Base constructed [${Object(this).name}]`)
  }

  protected get logger() {
    return this.params?.logger ?? Base.defaultLogger ?? console
  }
}
