import { Promisable } from '@xylabs/promise'

import { ModuleIdentifier } from './ModuleIdentifier'

export type ModuleIdentifierTransformerFunc = (id: ModuleIdentifier) => Promisable<ModuleIdentifier>

export interface ModuleIdentifierTransformer {
  transform: ModuleIdentifierTransformerFunc
}
