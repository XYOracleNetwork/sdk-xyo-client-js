import type { Promisable } from '@xylabs/promise'

import type { ModuleIdentifier } from './ModuleIdentifier.ts'

export type ModuleIdentifierTransformerFunc = (id: ModuleIdentifier) => Promisable<ModuleIdentifier | undefined>

export interface ModuleIdentifierTransformer {
  transform: ModuleIdentifierTransformerFunc
}
