import type { Logger } from '@xylabs/logger'

import type { ModuleIdentifierTransformer } from '../ModuleIdentifierTransformer.ts'

// eslint-disable-next-line unicorn/no-static-only-class
export class ResolveHelperStatic {
  static defaultLogger?: Logger
  static transformers: ModuleIdentifierTransformer[] = []
}
