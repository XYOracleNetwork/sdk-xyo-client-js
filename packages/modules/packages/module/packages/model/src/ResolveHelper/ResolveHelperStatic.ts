import { Logger } from '@xylabs/logger'

import { ModuleIdentifierTransformer } from '../ModuleIdentifierTransformer'

export class ResolveHelperStatic {
  static defaultLogger?: Logger
  static transformers: ModuleIdentifierTransformer[] = []
}
