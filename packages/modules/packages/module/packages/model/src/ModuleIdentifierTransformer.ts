import { Promisable } from '@xylabs/promise'

import { ModuleIdentifier } from './ModuleIdentifier.js'

export type ModuleIdentifierTransformerFunc = (id: ModuleIdentifier) => Promisable<ModuleIdentifier | undefined>

export interface ModuleIdentifierTransformer {
  transform: ModuleIdentifierTransformerFunc
}
