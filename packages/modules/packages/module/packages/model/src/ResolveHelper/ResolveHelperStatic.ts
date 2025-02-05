import type { Logger } from '@xylabs/logger'

import type { ModuleIdentifierTransformer } from '../ModuleIdentifierTransformer.ts'

export class ResolveHelperStatic {
  static readonly defaultLogger?: Logger
  static readonly transformers: ModuleIdentifierTransformer[] = []
}
