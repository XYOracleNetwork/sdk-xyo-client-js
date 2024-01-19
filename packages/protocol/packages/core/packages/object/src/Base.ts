import { Logger } from '@xylabs/logger'

import { EmptyObject } from './EmptyObject'

export type BaseParamsFields = {
  logger?: Logger
}

export type BaseParams<TAdditionalParams extends EmptyObject | void = void> = TAdditionalParams extends EmptyObject
  ? BaseParamsFields & TAdditionalParams
  : BaseParamsFields

export abstract class Base<TParams extends BaseParams = BaseParams> {
  static defaultLogger?: Logger

  constructor(readonly params: TParams) {
    params.logger?.debug(`Base constructed [${Object(this).name}]`)
  }

  protected get logger() {
    return this.params?.logger ?? Base.defaultLogger
  }
}
