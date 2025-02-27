import type { Logger } from '@xylabs/logger'

import type { ModuleIdentifierTransformer } from '../ModuleIdentifierTransformer.ts'

export class ResolveHelperStatic {
  static readonly defaultLogger?: Logger
  // eslint-disable-next-line sonarjs/public-static-readonly
  static transformers: ModuleIdentifierTransformer[] = []
}
